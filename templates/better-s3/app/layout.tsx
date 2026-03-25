import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <Toaster />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
