import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.scss";
import { ThemeProvider } from "@/context/ThemeContext";
import { InventoryProvider } from "@/context/InventoryContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexodus",
  description: "Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body className={inter.className}>
        <ThemeProvider>
          <InventoryProvider>{children}</InventoryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
