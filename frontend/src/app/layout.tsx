import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Grandma's Recipe Generator",
  description: "AI-powered recipe generator",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}