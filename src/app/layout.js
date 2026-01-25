import { Inter } from "next/font/google"
import "./globals.css"
import Footer from "./components/Footer"
import { CartProvider } from "./context/CartContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "SWAY - Fashion Discovery Platform",
  description: "Discover fashion through swipe-based shopping experience",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
