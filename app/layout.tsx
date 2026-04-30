import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Pengumuman Kelulusan",
  description: "Sistem pengumuman kelulusan siswa",
  icons: {
    icon: process.env.NEXT_PUBLIC_FAVICON_URL || '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
