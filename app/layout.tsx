import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bitácora 21',
  description: 'Redescubre tu deseo en 21 días de escritura consciente',
  manifest: '/manifest.json',
  themeColor: '#2C1810',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bitácora 21',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  )
}
