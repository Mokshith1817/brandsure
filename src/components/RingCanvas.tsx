"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Project } from "@/data/projects";
import { generatePosterCanvas } from "@/lib/posterGenerator";

interface RingCanvasProps {
  projects: Project[];
  focusedIndex: number;
  onFocusChange: (index: number) => void;
  onCardClick: (index: number) => void;
  onHoverCard: (index: number | null) => void;
  isInside?: boolean;
  onInsideChange?: (inside: boolean) => void;
}

const VERTEX_SHADER = `
  uniform float uCurve;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    // Barrel the plane along cylinder radius
    p.z -= p.x * p.x * uCurve;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTex;
  uniform float uVelocity;
  uniform float uDistance;
  uniform float uFocus;
  varying vec2 vUv;

  void main() {
    // Crucial: Double-sided correction so UV isn't mirrored when looking from inside the ring
    vec2 uv = gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y);

    // Chromatic aberration driven by rotation velocity
    float amt = clamp(abs(uVelocity) * 0.0035, 0.0, 0.006);
    vec3 col;
    if (amt > 0.0003) {
      col = vec3(
        texture2D(uTex, uv + vec2(amt, 0.0)).r,
        texture2D(uTex, uv).g,
        texture2D(uTex, uv - vec2(amt, 0.0)).b
      );
    } else {
      col = texture2D(uTex, uv).rgb;
    }

    // Depth falloff in light and saturation
    float d = clamp(uDistance, 0.0, 1.0);
    float grey = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(grey), d * d * 0.25);
    col *= mix(0.55, 1.0, 1.0 - d * d);

    // 1px hairline border using screen-space derivatives
    float e = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    float border = 1.0 - smoothstep(0.0, fwidth(e) * 1.6, e);
    col = mix(col, vec3(0.96, 0.95, 0.92), border * mix(0.3, 0.85, uFocus));

    gl_FragColor = vec4(col, 1.0);
  }
`;

const BG_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BG_FRAGMENT_SHADER = `
  uniform float uOffset;
  uniform float uInside;
  uniform vec3 uBase;
  uniform vec3 uLine;
  varying vec2 vUv;

  void main() {
    // Vertical rules traveling with rotation
    float x = fract(vUv.x * 60.0 + uOffset * 60.0);
    float rule = smoothstep(0.0, 0.03, x) * smoothstep(0.06, 0.03, x);

    // Rules brighten once visitor is inside and surrounded by them
    float strength = mix(0.16, 0.42, uInside);
    vec3 col = mix(uBase, uLine, clamp(rule, 0.0, 1.0) * strength);

    // Fade near poles
    float fade = smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.72, vUv.y);
    col = mix(uBase, col, fade);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Exact camera distance helper from WeCodeCoders
function calculateCameraDist(aspect: number, fov: number): number {
  const n = Math.tan((fov * Math.PI) / 360);
  const isPortrait = aspect < 1;
  return Math.max(
    4.9,
    2.15 / (2 * n * Math.max(aspect, 0.2) * (isPortrait ? 0.62 : 0.82)),
    2.7 / (2 * n * (isPortrait ? 0.46 : 0.66))
  );
}

export const RingCanvas: React.FC<RingCanvasProps> = ({
  projects,
  focusedIndex,
  onFocusChange,
  onCardClick,
  onHoverCard,
  isInside,
  onInsideChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const callbacksRef = useRef({
    onFocusChange,
    onCardClick,
    onHoverCard,
    onInsideChange,
  });
  callbacksRef.current = { onFocusChange, onCardClick, onHoverCard, onInsideChange };

  // Shared state ref for continuous 120fps physics loop
  const animRef = useRef({
    rotation: 0,
    targetRotation: 0,
    velocity: 0,
    isDragging: false,
    dragStartX: 0,
    lastX: 0,
    lastTime: performance.now(),
    focusedIndex: 0,
    hoverIndex: null as number | null,
    totalDragDist: 0,
    // Inside Ring state
    insideFactor: 0,      // 0 = outside, 1 = inside circle
    insideTarget: 0,
    forceInsideOverride: false,
    accumulatedScroll: 0,
    setTargetIndex: (idx: number) => {},
    setInside: (val: boolean) => {},
  });

  // Handle external focusedIndex changes
  useEffect(() => {
    if (animRef.current.setTargetIndex) {
      animRef.current.setTargetIndex(focusedIndex);
    }
  }, [focusedIndex]);

  // Handle external isInside prop changes
  useEffect(() => {
    if (isInside !== undefined && animRef.current.setInside) {
      animRef.current.setInside(isInside);
    }
  }, [isInside]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const count = projects.length;
    const cardWidth = 2.15;
    const cardHeight = 2.87;
    const radius =
      count < 3 ? 2.15 : (cardWidth * 0.977) / (2 * Math.sin(Math.PI / count));
    const stepAngle = (2 * Math.PI) / count;
    const fullTurn = 2 * Math.PI;

    animRef.current.setTargetIndex = (targetIdx: number) => {
      if (animRef.current.isDragging) return;
      const currentTurns = animRef.current.targetRotation / stepAngle;
      const targetTurns = -targetIdx;
      const diff = ((targetTurns - currentTurns) % count + count + count / 2) % count - count / 2;
      animRef.current.targetRotation = (currentTurns + diff) * stepAngle;
    };

    animRef.current.setInside = (val: boolean) => {
      animRef.current.forceInsideOverride = val;
      animRef.current.insideTarget = val ? 1 : 0;
    };

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#142139");

    const camera = new THREE.PerspectiveCamera(
      46,
      container.clientWidth / container.clientHeight,
      0.01,
      1000
    );

    const baseCamDist = calculateCameraDist(camera.aspect, 46);
    camera.position.set(0, 0.12, radius + baseCamDist);
    camera.lookAt(0, 0.08, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
      stencil: false,
      depth: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // 2. Background Cylinder (Radius 26, Height 34)
    const bgGeo = new THREE.CylinderGeometry(26, 26, 34, 64, 1, true);
    const bgMat = new THREE.ShaderMaterial({
      vertexShader: BG_VERTEX_SHADER,
      fragmentShader: BG_FRAGMENT_SHADER,
      side: THREE.BackSide,
      transparent: true,
      uniforms: {
        uOffset: { value: 0 },
        uInside: { value: 0 },
        uBase: { value: new THREE.Color("#0A0F1C") },
        uLine: { value: new THREE.Color("#F3EFE5") },
      },
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    scene.add(bgMesh);

    // 3. Ring Group holding cards
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const cardMeshes: THREE.Mesh[] = [];
    const cardMaterials: THREE.ShaderMaterial[] = [];
    const cardGeo = new THREE.PlaneGeometry(cardWidth, cardHeight, 28, 1);
    const curveAmount = 0.05;

    projects.forEach((proj, i) => {
      const posterCanvas = generatePosterCanvas(proj);
      const texture = new THREE.CanvasTexture(posterCanvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      const mat = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        side: THREE.DoubleSide, // Visible from both outside and inside
        uniforms: {
          uTex: { value: texture },
          uCurve: { value: curveAmount },
          uVelocity: { value: 0 },
          uDistance: { value: i === 0 ? 0 : 1 },
          uFocus: { value: i === 0 ? 1 : 0 },
        },
      });

      const mesh = new THREE.Mesh(cardGeo, mat);
      const angle = (i / count) * fullTurn;
      mesh.position.x = Math.sin(angle) * radius;
      mesh.position.z = Math.cos(angle) * radius;
      mesh.rotation.y = angle;
      mesh.userData = { index: i, project: proj };

      ringGroup.add(mesh);
      cardMeshes.push(mesh);
      cardMaterials.push(mat);
    });

    // 4. Raycasting for hover & click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000);

    const checkHover = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardMeshes, false);

      if (intersects.length > 0) {
        const hitIndex = intersects[0].object.userData.index;
        if (animRef.current.hoverIndex !== hitIndex) {
          animRef.current.hoverIndex = hitIndex;
          callbacksRef.current.onHoverCard(hitIndex);
        }
      } else {
        if (animRef.current.hoverIndex !== null) {
          animRef.current.hoverIndex = null;
          callbacksRef.current.onHoverCard(null);
        }
      }
    };

    // 5. Input Listeners
    const onPointerDown = (e: PointerEvent) => {
      animRef.current.isDragging = true;
      animRef.current.dragStartX = e.clientX;
      animRef.current.lastX = e.clientX;
      animRef.current.totalDragDist = 0;
      animRef.current.velocity = 0;
      animRef.current.lastTime = performance.now();
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (animRef.current.isDragging) {
        const now = performance.now();
        const dt = Math.max(1, now - animRef.current.lastTime);
        const dx = e.clientX - animRef.current.lastX;

        animRef.current.totalDragDist += Math.abs(dx);
        // Slightly higher sensitivity when inside
        const dragRatio = animRef.current.insideFactor > 0.5 ? 0.004 : 0.0032;
        animRef.current.targetRotation += dx * dragRatio;
        animRef.current.velocity = (dx * dragRatio) / (dt / 16.6);

        animRef.current.lastX = e.clientX;
        animRef.current.lastTime = now;
      } else {
        checkHover(e.clientX, e.clientY);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!animRef.current.isDragging) return;
      animRef.current.isDragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      if (animRef.current.totalDragDist < 6) {
        checkHover(e.clientX, e.clientY);
        if (animRef.current.hoverIndex !== null) {
          callbacksRef.current.onCardClick(animRef.current.hoverIndex);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      
      // Horizontal or regular rotation
      animRef.current.targetRotation -= delta * 0.002;
      animRef.current.velocity -= delta * 0.001;

      // Track accumulated vertical scroll to drive "DIVE INSIDE CIRCLE" transition
      animRef.current.accumulatedScroll += Math.abs(e.deltaY);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        animRef.current.targetRotation -= stepAngle;
        e.preventDefault();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        animRef.current.targetRotation += stepAngle;
        e.preventDefault();
      } else if (e.key.toLowerCase() === "i") {
        // Hotkey 'I' toggles inside/outside view!
        const next = animRef.current.insideFactor < 0.5;
        animRef.current.forceInsideOverride = next;
        callbacksRef.current.onInsideChange?.(next);
      }
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    // 6. Physics Animation Loop
    let animationFrameId: number;
    let lastFrameTime = performance.now();
    let lastReportedInside = false;

    const renderLoop = (time: number) => {
      animationFrameId = requestAnimationFrame(renderLoop);

      const dt = Math.min(0.05, (time - lastFrameTime) / 1000);
      lastFrameTime = time;

      // Inertia & Spring Snapping
      if (!animRef.current.isDragging) {
        animRef.current.velocity *= Math.pow(0.88, dt * 60);

        const currentTurns = animRef.current.targetRotation / stepAngle;
        const snapTurns = Math.round(currentTurns);
        const springForce = (snapTurns * stepAngle - animRef.current.targetRotation) * 0.12;

        animRef.current.targetRotation += springForce;
      }

      // Smooth rotation lerp
      const lerpSpeed = Math.min(1, 14 * dt);
      const prevRotation = animRef.current.rotation;
      animRef.current.rotation +=
        (animRef.current.targetRotation - animRef.current.rotation) * lerpSpeed;
      const angularVel = (animRef.current.rotation - prevRotation) / dt;

      ringGroup.rotation.y = animRef.current.rotation;

      // -------------------------------------------------------------
      // EXACT WECODECODERS TRANSITION: DIVE INSIDE THE 3D CYLINDER
      // -------------------------------------------------------------
      // When accumulated rotation passes 1 full turn (2*PI) or scroll threshold,
      // C smoothly transitions from 0 to 1 over 0.32 turns!
      let insideTarget = 0;
      if (animRef.current.forceInsideOverride) {
        insideTarget = 1.0;
      } else {
        // Natural scroll/rotation threshold
        const turns = Math.abs(animRef.current.rotation) / fullTurn;
        const scrollThresholdMet = animRef.current.accumulatedScroll > 320;
        
        if (turns > 0.85 || scrollThresholdMet) {
          insideTarget = Math.min(1, Math.max(0, (turns - 0.75) / 0.32));
          if (scrollThresholdMet && insideTarget < 1) {
            insideTarget = Math.min(1, insideTarget + (animRef.current.accumulatedScroll - 320) / 400);
          }
        }
      }

      // Smooth lerp of insideFactor
      animRef.current.insideFactor +=
        (insideTarget - animRef.current.insideFactor) * Math.min(1, 2.8 * dt * 60);
      const m = animRef.current.insideFactor;

      // Notify parent if inside mode changed
      const isCurrentlyInside = m > 0.5;
      if (isCurrentlyInside !== lastReportedInside) {
        lastReportedInside = isCurrentlyInside;
        callbacksRef.current.onInsideChange?.(isCurrentlyInside);
      }

      // 1. Camera positioning: flies from outside directly into the ring center!
      const P = calculateCameraDist(camera.aspect, camera.fov);
      camera.position.z = (radius + P) * (1 - m) + 0.001;
      camera.position.y = 0.15 * (1 - m);

      // 2. Camera rotation: smoothly turns 180 degrees to face the surrounding cards!
      camera.rotation.y = m * Math.PI;

      // 3. Camera FOV: expands from 46° to 82° for dramatic immersive panoramic view!
      const targetFov = 46 + 36 * m;
      if (Math.abs(camera.fov - targetFov) > 0.01) {
        camera.fov = targetFov;
        camera.updateProjectionMatrix();
      }

      // 4. Background cylinder uniforms
      bgMat.uniforms.uOffset.value = animRef.current.rotation / fullTurn;
      bgMat.uniforms.uInside.value = m;
      bgMesh.rotation.y = 0.35 * animRef.current.rotation;

      // 5. Ring Group scale: expands slightly when inside
      const scaleN = 1 + 0.5 * m;
      ringGroup.scale.set(scaleN, 1 + 0.12 * m, scaleN);

      // Vertical centering on portrait screens
      const portraitY =
        camera.aspect >= 1
          ? 0
          : 2 * P * Math.tan((camera.fov * Math.PI) / 360) * 0.12;
      ringGroup.position.y = portraitY * (1 - m);

      // Compute active focused card
      let normAngle = (-animRef.current.rotation) % fullTurn;
      if (normAngle < 0) normAngle += fullTurn;
      const activeIdx = Math.round(normAngle / stepAngle) % count;

      if (activeIdx !== animRef.current.focusedIndex) {
        animRef.current.focusedIndex = activeIdx;
        callbacksRef.current.onFocusChange(activeIdx);
      }

      // Update shader uniforms on each card
      for (let i = 0; i < count; i++) {
        const mat = cardMaterials[i];
        let diff = (i - activeIdx) % count;
        if (diff > count / 2) diff -= count;
        if (diff < -count / 2) diff += count;

        const distRatio = Math.abs(diff) / (count / 2);
        // Distance falloff adapts when inside so all surrounding cards stay readable
        const falloffRange = 2.2 - 1.35 * m;
        const isFocused = i === activeIdx ? 1 : 0;

        mat.uniforms.uVelocity.value = angularVel;
        mat.uniforms.uDistance.value = Math.min(1, distRatio * falloffRange);
        mat.uniforms.uFocus.value = isFocused;
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);

      cardMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) mesh.material.forEach((mat) => mat.dispose());
        else mesh.material.dispose();
      });
      bgGeo.dispose();
      bgMat.dispose();
      renderer.dispose();
    };
  }, [projects]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none touch-none"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
