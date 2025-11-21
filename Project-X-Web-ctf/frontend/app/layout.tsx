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
      <head>
        {/* React DevTools standalone */}
        <Script
          src="http://localhost:8097"
          strategy="beforeInteractive"
        />
      </head>

      <body className="font-mono">
        <NavbarWrapper /> 
        {children}
      </body>
    </html>
  );
}
