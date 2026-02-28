"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, User, LayoutDashboard, LogOut, ChevronDown } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

export default function AuthLayout({ children }) {
    const pathname = usePathname()
    const router = useRouter()
    const isLogin = pathname === "/login"

    const [user, setUser] = useState(null)
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
    const profileDropdownRef = useRef(null)

    useEffect(() => {
        try {
            const raw = localStorage.getItem("user")
            if (raw) {
                const parsed = JSON.parse(raw)
                setUser(parsed?.user || parsed)
            }
        } catch (e) {
            // ignore
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false)
            }
        }
        if (isProfileDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isProfileDropdownOpen])

    const handleLogout = () => {
        localStorage.removeItem("user")
        localStorage.removeItem("authToken")
        setUser(null)
        setIsProfileDropdownOpen(false)
        router.push("/login")
    }

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
                        <Link href="/">
                            <img src="/logo.png" alt="Logo" className="h-[24px] w-auto" />
                        </Link>
                    </h1>

                    {/* Login/Signup Toggle or User Dropdown */}
                    <div className="flex justify-center z-10">
                        {user ? (
                            <div className="relative" ref={profileDropdownRef}>
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center space-x-2 px-3 py-2 border-2 border-yellow-400 rounded-lg hover:bg-yellow-50 transition-colors bg-transparent shadow-sm"
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <span className="hidden md:block text-sm font-medium text-gray-900">{user.name || "User"}</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <Link
                                            href={user.role === "brand" ? "/brandDashboard" : "/customerDashboard"}
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-yellow-50 transition-colors"
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
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
                        )}
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
