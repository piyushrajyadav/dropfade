import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DropFade - Anonymous File & Text Sharing",
  description: "Secure, anonymous file and text sharing with one-time access",
  keywords: "file sharing, anonymous, secure, one-time access, temporary files",
  generator: 'v0.dev',
  icons: {
    icon: '/dropfade-logo.png',
    shortcut: '/dropfade-logo.png',
    apple: '/dropfade-logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
