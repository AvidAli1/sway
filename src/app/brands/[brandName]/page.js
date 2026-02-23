"use client"

import { useState, useEffect, useRef, use } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Loader2, Star, Filter, Heart, ShoppingBag, X, Search, ChevronRight, ChevronLeft, ChevronDown } from "lucide-react"
import Header from "../../components/Header"
import { useCart } from "../../context/CartContext"
import ToastNotification from "../../components/ToastNotification"

export default function BrandStorefront({ params }) {
    const unwrappedParams = use(params)
    const brandSlug = unwrappedParams.brandName

    const { cartCount, updateCartCount } = useCart()
    const [user, setUser] = useState(null)
    const [toastMessage, setToastMessage] = useState("")
    const [toastVisible, setToastVisible] = useState(false)
    const [toastType, setToastType] = useState("info")

    const [brand, setBrand] = useState(null)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [productsLoading, setProductsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState(null)

    // Filters state
    const [sortBy, setSortBy] = useState("newest")
    const [viewMode, setViewMode] = useState("grid")
    const [wishlist, setWishlist] = useState(new Set())
    const [filters, setFilters] = useState({
        categories: [],
        priceRange: [0, 25000],
        colors: [],
        collections: []
    })

    // Available filters from API
    const [availableCategories, setAvailableCategories] = useState([])
    const [availableColors, setAvailableColors] = useState([])

    // Auth & Wishlist Check
    useEffect(() => {
        try {
            const raw = localStorage.getItem("user")
            if (!raw) return
            const parsed = JSON.parse(raw)
            const sessionUser = parsed?.user || parsed
            if (sessionUser) {
                setUser(sessionUser)
                // Fetch wishlist
                const uId = sessionUser._id || sessionUser.id
                if (uId) {
                    fetch(`/api/customer/wishlist?userId=${uId}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.wishlist) {
                                setWishlist(new Set(data.wishlist.map(w => typeof w === 'object' ? w._id : w)))
                            }
                        })
                        .catch(err => console.error("Wishlist fetch error", err))
                }
            }
        } catch (e) {
            // ignore
        }
    }, [])

    const decodeBrandSlug = decodeURIComponent(brandSlug)

    useEffect(() => {
        // 1. Fetch Brand Info
        const fetchBrandInfo = async () => {
            try {
                const res = await fetch(`/api/customer/brands/${brandSlug}`)
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Brand not found")
                    throw new Error("Failed to load brand")
                }
                const data = await res.json()
                setBrand(data.brand)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchBrandInfo()
    }, [brandSlug])

    // 2. Fetch Brand Products
    useEffect(() => {
        const fetchBrandProducts = async () => {
            setProductsLoading(true)
            try {
                const p = new URLSearchParams()
                p.append('page', String(currentPage))
                p.append('limit', '12')
                p.append('brand', decodeBrandSlug)

                if (filters.categories.length > 0) p.append('category', filters.categories.join(','))
                if (filters.colors.length > 0) p.append('colors', filters.colors.join(','))
                if (filters.priceRange) {
                    p.append('minPrice', String(filters.priceRange[0]))
                    p.append('maxPrice', String(filters.priceRange[1]))
                }

                // Map Sort
                const mapSort = (s) => {
                    switch (s) {
                        case 'price-low': return { sortBy: 'price', sortOrder: 'asc' }
                        case 'price-high': return { sortBy: 'price', sortOrder: 'desc' }
                        case 'popular': return { sortBy: 'numReviews', sortOrder: 'desc' }
                        case 'newest':
                        default:
                            return { sortBy: 'createdAt', sortOrder: 'desc' }
                    }
                }
                const sortParams = mapSort(sortBy)
                p.append('sortBy', sortParams.sortBy)
                p.append('sortOrder', sortParams.sortOrder)

                const res = await fetch(`/api/customer/products?${p.toString()}`)
                if (!res.ok) throw new Error("Failed to load products")
                const data = await res.json()

                if (data.success) {
                    setProducts(data.products)
                    setPagination(data.pagination)

                    // Initialize available filters if not set
                    if (availableCategories.length === 0 && data.filters.categories) {
                        setAvailableCategories(data.filters.categories)
                    }
                    if (availableColors.length === 0 && data.filters.colors) {
                        setAvailableColors(data.filters.colors)
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                setProductsLoading(false)
            }
        }
        fetchBrandProducts()
    }, [brandSlug, currentPage, filters, sortBy, decodeBrandSlug])

    const showToastMsg = (msg, type) => {
        setToastMessage(msg)
        setToastType(type)
        setToastVisible(true)
    }

    const handleAddToCart = async (e, product) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) return showToastMsg("Please log in first", "info")
        if (user.role === "brand") return showToastMsg("Brands cannot make orders.", "error")
        if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
            window.location.href = `/productDetails/${product._id}`
            return
        }

        try {
            const token = localStorage.getItem("authToken")
            if (!token) return showToastMsg("Please log in first", "info")

            const res = await fetch("/api/customer/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: product._id,
                    quantity: 1,
                    size: product.sizes?.[0] || null,
                    color: product.colors?.[0] || null,
                }),
            })

            const data = await res.json()
            if (res.ok && data.success) {
                updateCartCount()
                showToastMsg("Added to cart", "success")
            } else {
                showToastMsg(data.error || "Failed to add to cart", "error")
            }
        } catch (error) {
            showToastMsg("Error adding to cart", "error")
        }
    }

    const toggleFilter = (type, value) => {
        setCurrentPage(1) // Reset to page 1 on filter change
        setFilters(prev => {
            const arr = prev[type]
            if (arr.includes(value)) {
                return { ...prev, [type]: arr.filter(i => i !== value) }
            } else {
                return { ...prev, [type]: [...arr, value] }
            }
        })
    }

    // Predefined UI color mapping identical to design
    const colorMap = {
        white: "bg-white",
        black: "bg-black",
        blue: "bg-blue-600",
        green: "bg-emerald-600",
        brown: "bg-amber-800",
        red: "bg-red-600",
        yellow: "bg-yellow-400"
    }

    const getBrandLogo = (logoPath) => {
        if (!logoPath) return "/placeholder.svg"
        return logoPath
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                <header className="bg-white border-b border-gray-200 h-16 w-full animate-pulse"></header>
                <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-8 animate-pulse">
                    <section className="relative h-[250px] md:h-[400px] rounded-3xl overflow-hidden mb-12 bg-gray-200 shadow-sm"></section>
                    <div className="flex flex-col lg:flex-row gap-10">
                        <aside className="w-full lg:w-72 flex-shrink-0">
                            <div className="bg-white p-6 rounded-3xl h-[600px] border border-gray-100 space-y-8 shadow-sm">
                                <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <div className="h-5 w-5 bg-gray-200 rounded"></div>
                                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </aside>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-6">
                                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                                <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-3xl overflow-hidden flex flex-col h-full border border-gray-100 shadow-sm">
                                        <div className="h-56 bg-gray-200"></div>
                                        <div className="p-5 flex flex-col flex-1 relative">
                                            <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
                                            <div className="mt-auto flex justify-between items-end pt-4">
                                                <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                                                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (error || !brand) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header user={user} onLoginClick={() => window.location.href = '/login'} viewMode="grid" onViewModeChange={() => { }} />
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <h1 className="text-3xl font-bold mb-4">Brand not found</h1>
                    <p className="text-gray-500 mb-6">We couldn't find the requested storefront.</p>
                    <Link href="/brands" className="bg-yellow-400 font-bold px-6 py-3 rounded-full hover:bg-yellow-500 text-black">View All Brands</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden font-sans">
            <ToastNotification message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} type={toastType} />

            <Header user={user} onLoginClick={() => window.location.href = '/login'} viewMode={viewMode} onViewModeChange={setViewMode} />

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
                {/* Brand Banner Section */}
                <section className="relative h-[250px] md:h-[400px] rounded-3xl overflow-hidden mb-12 shadow-md hover:shadow-lg transition-shadow">
                    <img
                        src={brand.bannerImage || "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/asset2.343Z-6wjTf9OpPxdbfCu0pZDKVMo2bsQbKF.png"}
                        alt={`${brand.name} Collection`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8 md:px-16">
                        <div className="bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-bold w-fit mb-4 uppercase shadow-sm">
                            OFFICIAL BRAND STORE
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 italic uppercase">{brand.name}</h1>
                        <p className="text-gray-200 max-w-md text-sm md:text-lg leading-relaxed line-clamp-3">
                            {brand.description || "Discover the latest in premium apparel and high-performance gear."}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-8">
                            <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_4px_14px_rgba(250,204,21,0.39)]">
                                New Arrivals
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-3 rounded-full font-bold transition-all whitespace-nowrap">
                                Best Sellers
                            </button>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="sticky top-28 space-y-8 bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-yellow-500" /> Filters
                                </h3>
                                <button
                                    onClick={() => {
                                        setFilters({ categories: [], priceRange: [0, 25000], colors: [], collections: [] })
                                        setCurrentPage(1)
                                    }}
                                    className="text-xs font-medium text-gray-400 hover:text-black transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Collections / Future Subcategories */}
                            <div>
                                <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-800">Collections</h4>
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search collections..."
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {/* Mock Collections, backend doesn't support collections natively yet without tags mapping */}
                                    {["Summer Drop", "Winter Essentials", "Heritage", "Premium Series"].map((coll, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={filters.collections.includes(coll)}
                                                onChange={() => toggleFilter('collections', coll)}
                                                className="w-4 h-4 rounded text-yellow-400 focus:ring-yellow-400 border-gray-300 accent-yellow-400"
                                            />
                                            <span className={`text-sm group-hover:text-black transition-colors ${filters.collections.includes(coll) ? 'text-black font-semibold' : 'text-gray-600'}`}>{coll}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Categories */}
                            {availableCategories.length > 0 && (
                                <div>
                                    <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-800">Categories</h4>
                                    <div className="space-y-3">
                                        {availableCategories.slice(0, 10).map((cat, idx) => {
                                            const isSelected = filters.categories.includes(cat)
                                            return (
                                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${isSelected ? 'border-yellow-400 bg-yellow-400' : 'border-gray-300 group-hover:border-yellow-400'}`}></div>
                                                    <span className={`text-sm transition-colors ${isSelected ? 'font-bold text-black' : 'text-gray-600 group-hover:text-black'}`}>{cat}</span>
                                                    <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleFilter('categories', cat)} />
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Price Range */}
                            <div>
                                <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-800">Price Range</h4>
                                <div className="space-y-4">
                                    <input
                                        type="range"
                                        min="0" max="50000" step="500"
                                        value={filters.priceRange[1]}
                                        onChange={(e) => {
                                            setFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], parseInt(e.target.value)] }))
                                            setCurrentPage(1)
                                        }}
                                        className="w-full accent-yellow-400 h-1.5 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #facc15 ${(filters.priceRange[1] / 50000) * 100}%, #e5e7eb ${(filters.priceRange[1] / 50000) * 100}%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs font-bold text-gray-700">
                                        <span className="bg-gray-100 px-3 py-1 rounded">PKR {filters.priceRange[0]}</span>
                                        <span className="bg-gray-100 px-3 py-1 rounded">PKR {filters.priceRange[1].toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Colors */}
                            {availableColors.length > 0 && (
                                <div>
                                    <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-800">Colors</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {availableColors.slice(0, 15).map(c => {
                                            const isSelected = filters.colors.includes(c)
                                            const colorClass = colorMap[c.toLowerCase()] || "bg-gray-300"
                                            return (
                                                <button
                                                    key={c}
                                                    onClick={() => toggleFilter('colors', c)}
                                                    className={`w-8 h-8 rounded-full border-2 border-white ring-1 transition-all ${isSelected ? 'ring-2 ring-yellow-400 outline outline-2 outline-white scale-110 shadow-sm' : 'ring-gray-200 hover:ring-gray-400'} ${colorClass}`}
                                                    title={c}
                                                ></button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Products Area */}
                    <section className="flex-1">
                        <div className="flex flex-wrap items-center justify-between mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 font-medium">
                                <span className="text-black font-bold">{pagination?.totalProducts || 0}</span> products found in <span className="italic font-bold text-gray-800">{brand.name}</span>
                            </p>

                            <div className="flex items-center gap-4">
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium py-2 px-8 focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:24px] bg-[position:right_4px_center] bg-no-repeat cursor-pointer"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="popular">Popularity</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {productsLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                                <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
                                <p className="text-gray-500">Try changing your filters or search terms.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                                {products.map((p, index) => {
                                    const isSale = p.originalPrice > p.price
                                    const discount = isSale ? Math.round((1 - p.price / p.originalPrice) * 100) : 0

                                    return (
                                        <Link href={`/productDetails/${p._id}`} key={p._id} className="block">
                                            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full">
                                                <div className="relative">
                                                    <img
                                                        src={p.thumbnail?.HD || p.images?.[0]?.HD || "/placeholder.svg"}
                                                        alt={p.name}
                                                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />

                                                    {/* Badges */}
                                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                        {isSale && (
                                                            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                                                {discount}% OFF
                                                            </span>
                                                        )}
                                                        {p.isFeatured && (
                                                            <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold">NEW</span>
                                                        )}
                                                        {p.inStock === false && (
                                                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">Out of Stock</span>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={(e) => { e.preventDefault(); /* Wishlist toggle logic here */ }}
                                                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${wishlist.has(p._id) ? "bg-red-500 text-white" : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white"}`}
                                                    >
                                                        <Heart className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="p-4 flex flex-col flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm">{p.ratings?.toFixed(1) || 4.5}</span>
                                                        </div>
                                                        <span className="text-sm text-gray-400">({p.numReviews || 0})</span>
                                                        <span className="text-sm text-gray-400">•</span>
                                                        <span className="text-sm text-gray-600 truncate">{brand.name}</span>
                                                    </div>

                                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{p.name}</h3>

                                                    <div className="flex items-center gap-2 mb-3 mt-auto">
                                                        <span className="text-lg font-bold text-gray-900">PKR {p.price.toLocaleString()}</span>
                                                        {isSale && (
                                                            <span className="text-sm text-gray-500 line-through">PKR {p.originalPrice.toLocaleString()}</span>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={(e) => handleAddToCart(e, p)}
                                                        disabled={p.inStock === false}
                                                        className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {p.inStock !== false ? "Add to Cart" : "Out of Stock"}
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}

                        {/* Pagination Component */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-16 mb-8">
                                <button
                                    disabled={!pagination.hasPrevPage}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:bg-gray-50"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-all ${currentPage === pageNum
                                            ? 'bg-yellow-400 text-black shadow-md border-transparent'
                                            : 'border border-gray-200 text-gray-600 hover:bg-gray-100 bg-white hover:border-gray-300'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}

                                <button
                                    disabled={!pagination.hasNextPage}
                                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:bg-gray-50 bg-white"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* Swipe Your Style CTA matching design */}
            <section className="max-w-[1400px] mx-auto px-6 py-12">
                <div className="bg-black rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative shadow-2xl">
                    <div className="flex-1 z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 italic uppercase tracking-tight">SWIPE YOUR STYLE</h2>
                        <p className="text-gray-400 text-lg mb-8 max-w-sm leading-relaxed">Don't know what to pick? Try our Tinder-style shopping experience and build your bucket in seconds.</p>
                        <Link
                            href="/swipe"
                            className="inline-flex items-center gap-3 bg-yellow-400 px-8 py-4 rounded-full font-black text-black text-lg hover:scale-105 transition-all hover:bg-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                        >
                            Launch Swipe Shop <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="flex-1 relative z-10 mt-12 md:mt-0">
                        <div className="relative w-72 h-[450px] mx-auto hidden md:block">
                            <div className="absolute inset-0 bg-white/10 rounded-3xl rotate-6 shadow-xl backdrop-blur-sm border border-white/10"></div>
                            <div className="absolute inset-0 bg-white/20 rounded-3xl -rotate-3 shadow-xl backdrop-blur-sm border border-white/20"></div>
                            <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl p-4 flex flex-col border border-gray-100">
                                <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/asset1-yDCzN4GGsiQtY5DrLsifRUR0vFK4da.webp" alt="Swipe Preview" className="w-full h-72 object-cover rounded-2xl mb-4 shadow-sm" />
                                <p className="font-bold text-gray-900 line-clamp-1">{brand.name} Style Hoodie</p>
                                <p className="text-yellow-600 font-black mb-2">PKR 4,500</p>
                                <div className="mt-auto flex justify-between gap-2">
                                    <button className="flex-1 h-12 rounded-xl bg-gray-50 hover:bg-red-50 group transition-colors flex items-center justify-center border border-gray-100">
                                        <X className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                                    </button>
                                    <button className="flex-1 h-12 rounded-xl bg-yellow-400 hover:bg-yellow-500 group transition-colors flex items-center justify-center shadow-sm">
                                        <Star className="w-6 h-6 text-yellow-800 group-hover:scale-110 transition-transform fill-yellow-800" />
                                    </button>
                                    <button className="flex-[1.5] h-12 rounded-xl bg-black hover:bg-gray-800 flex items-center justify-center shadow-md">
                                        <ShoppingBag className="w-5 h-5 text-white mr-2" />
                                        <span className="text-white font-bold text-sm">Add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Background Glow */}
                    <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-yellow-400/20 blur-[100px] rounded-full point-events-none"></div>
                    <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-yellow-400/10 blur-[100px] rounded-full point-events-none"></div>
                </div>
            </section>
        </div>
    )
}
