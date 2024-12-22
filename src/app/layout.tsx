"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthCheck } from "@/components/auth/auth-check";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthCheck>{children}</AuthCheck>
        </Providers>
      </body>
    </html>
  );
}
