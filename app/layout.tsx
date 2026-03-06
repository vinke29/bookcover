import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoverCraft — AI Book Cover Designer",
  description: "Design stunning book covers with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-zinc-950 text-zinc-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
