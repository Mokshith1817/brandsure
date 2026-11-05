import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mokshith — Selected Works & Engineering Architecture",
  description:
    "Interactive 3D cylindrical showcase of systems programming, WebGPU graphics engines, distributed agent protocols, and high-performance software artifacts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#142139] text-[#f3efe5] antialiased">
        {children}
      </body>
    </html>
  );
}
