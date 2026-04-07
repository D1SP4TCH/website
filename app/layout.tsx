import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/ui/smooth-scroll-provider";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Navigation } from "@/components/layouts/navigation";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { AchievementsProvider } from "@/components/ui/achievements-provider";
import { SkipLink } from "@/components/ui/skip-link";
import { AccessibilityMenu } from "@/components/ui/accessibility-menu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio | Technical Designer",
  description:
    "A unique portfolio showcasing technical design skills in web development, game design, and interactive experiences.",
  keywords: [
    "technical designer",
    "web developer",
    "game designer",
    "interactive design",
    "3D web experiences",
  ],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Portfolio | Technical Designer",
    description:
      "A unique portfolio showcasing technical design skills in web development, game design, and interactive experiences.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased cursor-none lg:cursor-none`}
        style={{
          margin: 0,
          padding: 0,
          width: "100%",
          minHeight: "100vh",
          overflowX: "hidden",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <SmoothScrollProvider>
          <AchievementsProvider>
            <SkipLink />
            <ScrollProgress />
            <CustomCursor />
            <Navigation />
            <div id="main-content" style={{ position: "relative", width: "100%" }}>
              {children}
            </div>
            <AccessibilityMenu />
          </AchievementsProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
