import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pointex-gamma.vercel.app"),

  title: "Pointex",
  description:
    "Challenge your friend in a strategic grid game. Capture, squares, outsmart your opponent, and score the highest.",
  keywords: ["game", "strategy game", "grid game", "multiplayer", "pointex"],
  icons: {
    icon: [
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/icon-512x512.png",
  },

  openGraph: {
    title: "Pointex",
    description: "Capture, squares, outsmart your opponent.",
    type: "website",
    images: [
      {
        url: "/images/twitter-card.png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Pointex",
    description: "Capture, squares, outsmart your opponent.",
    images: ["/images/twitter-card.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b1020] flex flex-col">
        {children}
      </body>
    </html>
  );
}
