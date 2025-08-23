import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Yo'l yo'lakay - Boshqaruv paneli",
  description: "Yo'l yo'lakay tizimi uchun admin paneli",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthGuard>
          <div className="flex h-screen min-h-0 bg-gray-100">
            <Sidebar />
            <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
          </div>
        </AuthGuard>
      </body>
    </html>
  )
}
