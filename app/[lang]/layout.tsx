import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { locales, Locale } from "../../lib/i18n";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Luxe Estate - Premium Real Estate",
  description: "Find your sanctuary.",
};

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  return (
    <html lang={lang}>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} bg-background-light text-nordic-dark font-display antialiased selection:bg-mosque selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
