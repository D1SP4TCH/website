import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import { SmoothScrollProvider } from "@/components/ui/smooth-scroll-provider";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Navigation } from "@/components/layouts/navigation";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { AchievementsProvider } from "@/components/ui/achievements-provider";
import { AccessibilityMenu } from "@/components/ui/accessibility-menu";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
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
        className={`${poppins.variable} ${geistMono.variable} antialiased cursor-none lg:cursor-none`}
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
            <ScrollProgress />
            <CustomCursor />
            <Navigation />
            <div
              id="main-content"
              style={{
                position: "relative",
                width: "100%",
                // Keep all page content below fixed top navigation.
                paddingTop: "6rem",
                // Match light pages so the padded zone is not garden green; dark pages extend with -mt-24 pt-24 on <main>.
                backgroundColor: "var(--background)",
                minHeight: "100vh",
              }}
            >
              {children}
            </div>
            <AccessibilityMenu />
          </AchievementsProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
