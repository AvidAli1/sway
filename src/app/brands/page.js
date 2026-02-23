"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Loader2, Search } from "lucide-react"
import Header from "../components/Header"
import ToastNotification from "../components/ToastNotification"

export default function BrandsPage() {
    const [brands, setBrands] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState(null)

    const [toastMessage, setToastMessage] = useState("")
    const [toastVisible, setToastVisible] = useState(false)
    const [toastType, setToastType] = useState("info")
    const [user, setUser] = useState(null)

    // Auth check
    useEffect(() => {
        try {
            const raw = localStorage.getItem("user")
            if (!raw) return
            const parsed = JSON.parse(raw)
            const sessionUser = parsed?.user || parsed
            if (sessionUser) setUser(sessionUser)
        } catch (e) {
            // ignore
        }
    }, [])

    const fetchBrands = async (page) => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/customer/brands?page=${page}&limit=12&onlyWithProducts=true`)
            if (!res.ok) throw new Error("Failed to fetch brands")
            const data = await res.json()

            if (data.success) {
                setBrands(data.brands)
                setPagination(data.pagination)
            } else {
                throw new Error(data.error || "Failed to fetch brands")
            }
        } catch (err) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBrands(currentPage)
        // scroll to top on page change
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [currentPage])

    const showToast = (message, type = "info") => {
        setToastMessage(message)
        setToastType(type)
        setToastVisible(true)
    }

    // Helper function to safely get brand logo or return fallback
    const getBrandLogo = (logoPath) => {
        if (!logoPath) return "/placeholder.svg"
        if (logoPath.startsWith("http")) return logoPath
        return logoPath // assuming the path works if relative
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <ToastNotification
                message={toastMessage}
                isVisible={toastVisible}
                onClose={() => setToastVisible(false)}
                type={toastType}
            />

            <Header user={user} onLoginClick={() => window.location.href = '/login'} viewMode="grid" onViewModeChange={() => { }} />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                {/* Page Title & Breadcrumb */}
                <div className="mb-10 text-center relative max-w-2xl mx-auto">
                    <h1 className="text-4xl font-black italic tracking-tight text-gray-900 mb-2 uppercase">Official Brands</h1>
                    <p className="text-gray-500">Discover premium collections from our verified partners.</p>
                </div>

                {/* Loading State */}
                {loading && !brands.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col h-full border border-gray-100">
                                <div className="h-40 bg-gray-200"></div>
                                <div className="px-6 pb-6 pt-12 relative flex-1 flex flex-col items-center">
                                    <div className="absolute -top-10 bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
                                        <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                                    </div>
                                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-8 w-32 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-red-500 font-bold text-2xl">!</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong.</h3>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <button
                            onClick={() => fetchBrands(currentPage)}
                            className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold hover:bg-yellow-500 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : brands.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Brands Found</h3>
                        <p className="text-gray-500">Check back later for exciting new brand partnerships.</p>
                    </div>
                ) : (
                    <>
                        {/* Brands Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {brands.map((brand) => (
                                <Link
                                    href={`/brands/${encodeURIComponent(brand.name)}`}
                                    key={brand._id}
                                    className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
                                >
                                    {/* Brand Banner Preview (using logo backdrop or actual banner) */}
                                    <div className="h-40 w-full overflow-hidden relative bg-gray-100">
                                        <img
                                            src={brand.bannerImage || getBrandLogo(brand.logo)}
                                            alt={`${brand.name} banner`}
                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!brand.bannerImage ? 'opacity-30 blur-sm scale-125' : ''}`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                    </div>

                                    {/* Absolute Brand Logo Bubble */}
                                    <div className="absolute top-24 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-2xl shadow-lg border-4 border-white overflow-hidden flex items-center justify-center group-hover:shadow-xl transition-shadow z-10 rotate-3 group-hover:rotate-0 transform duration-300">
                                        <img
                                            src={getBrandLogo(brand.logo)}
                                            alt={brand.name}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 pt-12 flex-1 flex flex-col items-center text-center">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">{brand.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                            {brand.description || "Discover the latest premium fashion and exclusive styles from " + brand.name + "."}
                                        </p>

                                        <div className="mt-auto pt-4 flex items-center justify-center font-bold text-sm text-black group-hover:text-yellow-600 transition-colors w-full border-t border-gray-100">
                                            Visit Storefront <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-16 mb-8">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={!pagination.hasPrevPage}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 bg-white"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>

                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-colors ${currentPage === page
                                            ? 'bg-yellow-400 text-black shadow-md'
                                            : 'border border-gray-200 text-gray-600 hover:bg-gray-100 bg-white'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={!pagination.hasNextPage}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 bg-white"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
