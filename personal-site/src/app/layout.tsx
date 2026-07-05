import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FAN JUN JIE | AI Product & Data Analysis Portfolio",
  description:
    "FAN JUN JIE 个人作品站，展示 AI 产品、数据分析项目、自动化工具、量化交易与创意工程作品。",
  keywords: ["FAN JUN JIE", "AI 产品", "数据分析", "统计建模", "Next.js", "Three.js", "个人作品集"],
  authors: [{ name: "FAN JUN JIE" }],
  creator: "FAN JUN JIE",
  openGraph: {
    title: "FAN JUN JIE | AI Product & Data Analysis Portfolio",
    description:
      "沉浸式个人作品站：AI 产品、数据分析、自动化工具、量化交易与创意工程。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${inter.variable} bg-black text-white antialiased font-sans`}
      >
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
