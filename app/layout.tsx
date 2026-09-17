import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme_provider";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeSentry",
  description: "Your AI code reviewer",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return (
    <html
    lang="en"
    className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
        <ThemeProvider
        attribute={"class"}
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        >
          <Toaster />
          {children}
        </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
