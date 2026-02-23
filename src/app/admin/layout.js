'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for token/role authentication
        const token = localStorage.getItem('authToken')
        const userStr = localStorage.getItem('user')

        if (!token || !userStr) {
            router.push('/login')
            return
        }

        try {
            const user = JSON.parse(userStr)
            // Check if user object has nested user property or direct properties
            const role = user.user?.role || user.role

            if (role !== 'admin') {
                router.push('/login')
                return
            }

            setLoading(false)
        } catch (e) {
            console.error('Error parsing user data', e)
            router.push('/login')
        }
    }, [router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-black text-white hidden md:block">
                <div className="p-6">
                    <Link href="/admin/dashboard" className="text-2xl font-bold tracking-wider">
                        SW<span className="text-yellow-400">A</span>Y
                    </Link>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Admin Panel</p>
                </div>

                <nav className="mt-6">
                    <Link
                        href="/admin/dashboard"
                        className={`block py-3 px-6 transition-colors ${pathname === '/admin/dashboard' ? 'text-yellow-400 bg-gray-900 border-l-4 border-yellow-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/complaints"
                        className={`block py-3 px-6 transition-colors ${pathname === '/admin/complaints' ? 'text-yellow-400 bg-gray-900 border-l-4 border-yellow-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        Complaints
                    </Link>
                    <Link
                        href="/admin/invites"
                        className={`block py-3 px-6 transition-colors ${pathname === '/admin/invites' ? 'text-yellow-400 bg-gray-900 border-l-4 border-yellow-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    >
                        Send Invites
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-gray-800">Administrator</h1>
                    <button
                        onClick={() => {
                            localStorage.removeItem('authToken')
                            localStorage.removeItem('user')
                            router.push('/login')
                        }}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                        Logout
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
