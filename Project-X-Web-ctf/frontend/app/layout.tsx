import type { Metadata } from "next";
import "./globals.css";

import NavbarWrapper from "./components/NavbarWrapper";

export const metadata: Metadata = {
  title: "Project X - CTF Platform",
  description: "Capture The Flag hacking challenges",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-mono">
        <NavbarWrapper /> 
        {children}
      </body>
    </html>
  );
}
