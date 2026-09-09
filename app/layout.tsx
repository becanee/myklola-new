import type { Metadata } from 'next'
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import React from "react"
import './globals.css'

const instrumentSans = Instrument_Sans({ 
  subsets: ["latin"],
  variable: '--font-instrument'
});

const instrumentSerif = Instrument_Serif({ 
  subsets: ["latin"],
  weight: "400",
  variable: '--font-instrument-serif'
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains'
});

const SITE_NAME = 'Klola';
const APP_DESCRIPTION = 'Portal tiket dan demo produk Klola Indonesia — hub terpadu untuk dukungan pelanggan, pelacakan masalah, dan akses langsung ke tim support.';
const APP_URL = 'https://portal.myklola.cloud';

export const metadata: Metadata = {
  title: {
    default: `Portal — ${SITE_NAME} Indonesia`,
    template: `%s | ${SITE_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    'Klola',
    'ticket portal',
    'dukungan pelanggan',
    'pelaporan masalah',
    'demo produk',
    'helpdesk',
    'support tiket',
    'Klola Indonesia',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    countryName: 'Indonesia',
    title: `${SITE_NAME} — Portal Tiket & Demo Produk`,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: '/logo-blue.png',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Portal Tiket & Demo Produk`,
    description: APP_DESCRIPTION,
    images: ['/logo-blue.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'google-site-verification-code-here', // ganti dengan value asli
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
