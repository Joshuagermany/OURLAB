import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OURLAB. | 전국 4년제 대학 연구실 리뷰 플랫폼",
  description: "연구실 문화/워라밸/지도교수 커뮤니케이션 등 실사용자 후기를 바탕으로 더 나은 선택을 도와드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black`}>
        <div className="relative flex min-h-screen flex-col">
          <div className="hidden xl:block fixed top-24 left-24 bottom-48 w-32">
            <AdBanner className="h-full" label="광고" position="left" />
          </div>
          <div className="hidden xl:block fixed top-24 right-24 bottom-48 w-32">
            <AdBanner className="h-full" label="광고" position="right" />
          </div>
          <Header />
          <main className="flex-grow mx-auto max-w-6xl px-4">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
