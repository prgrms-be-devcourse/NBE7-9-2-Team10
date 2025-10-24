import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from '@/components/layout/Layout';
import { ToastProvider } from '@/components/ui/Toast';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import ConditionalLayout from '@/components/layout/ConditionalLayout';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unimate - 룸메이트 매칭 서비스",
  description: "대학생들을 위한 룸메이트 매칭 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
