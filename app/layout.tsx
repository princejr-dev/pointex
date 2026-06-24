import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pointex - Point Game",
  description: "A strategic grid-based two-player game",
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-512x512.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`min-h-screen bg-[#05070f] text-white`}
    >
      <body className="min-h-full flex flex-col ">{children}</body>
    </html>
  );
}
