"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { usePathname } from "next/navigation"

export default function AuthLayout({ children }) {
    const pathname = usePathname()
    const isLogin = pathname === "/login"

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-4 shrink-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between relative">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors z-10">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="sm:hidden">Back</span>
                        <span className="hidden sm:inline">Back to Home</span>
                    </Link>

                    <h1 className="text-xl sm:text-2xl font-bold text-black absolute left-1/2 transform -translate-x-1/2 z-0">
                        <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
                    </h1>

                    {/* Login/Signup Toggle */}
                    <div className="flex justify-center z-10">
                        <div className="relative flex items-center bg-gray-100/80 backdrop-blur-sm p-1 rounded-full border border-gray-200 shadow-sm w-[150px]">
                            {/* Animated Pill Background */}
                            <div
                                className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-yellow-400 rounded-full shadow-sm transition-transform duration-300 ease-in-out"
                                style={{ transform: isLogin ? "translateX(0)" : "translateX(100%)" }}
                            ></div>

                            <Link
                                href="/login"
                                className={`relative flex-1 text-center py-1.5 text-sm font-semibold transition-colors z-10 ${isLogin ? 'text-black' : 'text-gray-600 hover:text-black'}`}
                            >
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className={`relative flex-1 text-center py-1.5 text-sm font-semibold transition-colors z-10 ${!isLogin ? 'text-black' : 'text-gray-600 hover:text-black'}`}
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col">
                {children}
            </main>
        </div>
    )
}
