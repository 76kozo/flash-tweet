import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Flash Tweet | AIツイート作成アシスタント",
  description: "キーワードからAIがX(旧Twitter)の投稿を作成します。本文と画像を生成し、ワンクリックで投稿画面へ。",
  applicationName: "FlashTweet",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FlashTweet",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          notoSansJp.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
