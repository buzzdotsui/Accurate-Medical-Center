import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { siteConfig } from "@/config/site";

const inter = localFont({
  src: "../../public/fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const plusJakartaSans = localFont({
  src: "../../public/fonts/PlusJakartaSans-Variable.woff2",
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  weight: "200 800",
});

/** Elegant italic serif, used by marketing landing page for headings and Vision/Mission panels */
const playfairDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/PlayfairDisplay-Variable.woff2",
      style: "normal",
      weight: "400 900",
    },
    {
      path: "../../public/fonts/PlayfairDisplay-Italic-Variable.woff2",
      style: "italic",
      weight: "400 900",
    },
  ],
  variable: "--font-playfair-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "hospital Akure",
    "medical center Ondo State",
    "healthcare Nigeria",
    "Accurate Medical Center",
    "doctor Akure",
    "ambulance Akure",
    "pregnancy delivery Akure",
    "psychological therapy Nigeria",
    "online consultation hospital",
    "infertility care Ondo",
  ],
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
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
        className={`${inter.variable} ${plusJakartaSans.variable} ${playfairDisplay.variable} antialiased font-sans min-h-screen flex flex-col bg-background`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <ToastProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
