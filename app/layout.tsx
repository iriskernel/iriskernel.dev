import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { themeScript } from "@/components/ThemeToggle";
import { TopBar } from "@/components/TopBar";
import { site } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.handle, template: `%s · ${site.handle}` },
  description: site.bio,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-theme is set by the script before React loads, so React must not complain about it
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-md focus:bg-bg focus:px-3 focus:py-2">
          Skip to content
        </a>
        <TopBar />
        <main id="main" className="mx-auto w-full max-w-[1000px] flex-1 px-6 pt-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
