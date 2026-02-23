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
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow flex flex-col min-h-screen">
              {children}
            </main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  )
}
