"use client"

import { useState, useEffect, useRef } from "react"
import {
  Search,
  Grid,
  List,
  Heart,
  ShoppingCart,
  Star,
  ArrowLeft,
  SlidersHorizontal,
  X,
  ChevronDown,
  Check,
  User,
  LogOut,
  LayoutDashboard,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import ToastNotification from "../components/ToastNotification"
import { useCart } from "../context/CartContext"
import { Suspense } from "react"

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { cartCount, updateCartCount } = useCart()
  const [user, setUser] = useState(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const [toastMessage, setToastMessage] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState("info")
  const [viewMode, setViewMode] = useState("grid") // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const [wishlist, setWishlist] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1)
  const [productsPerPage] = useState(50)
  const [categoriesList, setCategoriesList] = useState([])
  const [subCategoriesList, setSubCategoriesList] = useState([])
  const [brandsList, setBrandsList] = useState([])
  const [colorsList, setColorsList] = useState([])
  const [seasonsList, setSeasonsList] = useState([])
  const [maxAvailablePrice, setMaxAvailablePrice] = useState(15000)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef(null)

  const [filters, setFilters] = useState({
    brands: searchParams.get('brand') ? searchParams.get('brand').split(',') : [],
    categories: searchParams.get('subCategory') ? searchParams.get('subCategory').split(',') : [],
    subCategories: [], // Added subCategories
    priceRange: [
      searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')) : 0,
      searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')) : 15000
    ],
    sizes: searchParams.get('sizes') ? searchParams.get('sizes').split(',') : [],
    colors: searchParams.get('colors') ? searchParams.get('colors').split(',') : [],
    seasons: searchParams.get('season') ? searchParams.get('season').split(',') : [],
    rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')) : 0,
    inStock: searchParams.get('inStock') === 'true',
  })

  useEffect(() => {
    // Initial sync for search/sort
    if (searchParams.get('search')) setSearchQuery(searchParams.get('search'))
    if (searchParams.get('featured') === 'true') {
      setSortBy('featured')
    } else if (searchParams.get('sortBy')) {
      const sort = searchParams.get('sortBy')
      const order = searchParams.get('sortOrder')
      if (sort === 'price' && order === 'asc') setSortBy('price-low')
      else if (sort === 'price' && order === 'desc') setSortBy('price-high')
      else if (sort === 'createdAt') setSortBy('newest')
      else if (sort === 'ratings') setSortBy('rating')
      else if (sort === 'numReviews') setSortBy('popular')
      else if (sort === 'recommended') setSortBy('recommended')
    }
  }, [searchParams])

  // Auth & Wishlist Check
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const u = JSON.parse(userData)
        const sessionUser = u.user || u
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
      } catch (e) {
        console.error("Auth parse error", e)
      }
    }
  }, [])
  // Product data loaded from backend
  const [allProducts, setAllProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(null)
  const lastFetchParamsRef = useRef(null)
  const hasSeededFiltersRef = useRef(false)

  // Fetch products from backend API (server-side filtering)
  // Fetch products function
  const fetchProducts = async (page, shouldReplace) => {
    setProductsLoading(true)
    setProductsError(null)
    try {
      const p = new URLSearchParams()

      p.append('page', String(page))
      // special-case: when user selects "featured" we might want fewer products or we just keep it consistent.
      // Let's keep it consistent or use productsPerPage.
      p.append('limit', String(sortBy === 'featured' ? 8 : productsPerPage))

      if (searchQuery) p.append('search', searchQuery)
      if (filters.categories && filters.categories.length > 0) p.append('subCategory', filters.categories.join(','))
      if (filters.brands && filters.brands.length > 0) p.append('brand', filters.brands.join(','))
      if (filters.sizes && filters.sizes.length > 0) p.append('sizes', filters.sizes.join(','))
      if (filters.colors && filters.colors.length > 0) p.append('colors', filters.colors.join(','))
      if (filters.seasons && filters.seasons.length > 0) p.append('season', filters.seasons.join(','))
      if (filters.priceRange) {
        p.append('minPrice', String(filters.priceRange[0] || 0))
        p.append('maxPrice', String(filters.priceRange[1] || 0))
      }
      if (filters.rating) p.append('rating', String(filters.rating))
      if (filters.inStock) p.append('inStock', 'true')

      if (sortBy === 'featured') {
        p.append('featured', 'true')
      } else {
        // map UI sort option to backend sortBy + sortOrder
        const mapSort = (s) => {
          switch (s) {
            case 'price-low':
              return { sortBy: 'price', sortOrder: 'asc' }
            case 'price-high':
              return { sortBy: 'price', sortOrder: 'desc' }
            case 'rating':
              return { sortBy: 'ratings', sortOrder: 'desc' }
            case 'newest':
              return { sortBy: 'createdAt', sortOrder: 'desc' }
            case 'popular':
              return { sortBy: 'numReviews', sortOrder: 'desc' }
            case 'recommended':
              return { sortBy: 'recommended', sortOrder: 'desc' }
            default:
              return null
          }
        }
        const sortParams = mapSort(sortBy)
        if (sortParams?.sortBy) p.append('sortBy', sortParams.sortBy)
        if (sortParams?.sortOrder) p.append('sortOrder', sortParams.sortOrder)
      }

      const paramsString = p.toString()

      // Allow fetching if page is 1 (always fresh on filter change) or if params changed
      if (page > 1 && lastFetchParamsRef.current === paramsString) {
        setProductsLoading(false)
        return
      }
      lastFetchParamsRef.current = paramsString

      const url = `/api/customer/products?${paramsString}`

      // but for infinite scroll, page changes, so params change.
      let headers = {};
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Failed to retrieve token:", e);
      }

      const res = await fetch(url, { headers, credentials: 'include' })
      if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
      const data = await res.json()

      const newProducts = (data && Array.isArray(data.products)) ? data.products.map(p => ({
        id: p._id,
        title: p.name,
        brand: (p.brand && p.brand.name) || (p.brand || ''),
        price: p.price,
        originalPrice: p.originalPrice,
        image: (p.thumbnail && p.thumbnail.SD) || (p.images && p.images[0] && p.images[0].SD) || '/placeholder.svg',
        category: p.category,
        sizes: p.sizes || [],
        colors: p.colors || [],
        rating: p.ratings || 0,
        reviews: p.numReviews || 0,
        description: p.description || '',
        inStock: !!p.inStock,
        isSponsored: !!p.isFeatured,
        tags: p.tags || [],
        score: p.score,
      })) : []

      if (shouldReplace) {
        setAllProducts(newProducts)
      } else {
        setAllProducts(prev => {
          // Filter out duplicates based on ID
          const existingIds = new Set(prev.map(p => p.id))
          const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id))
          return [...prev, ...uniqueNewProducts]
        })
      }

      // Update metadata
      if (data && data.pagination) {
        setHasMore(data.pagination.hasNextPage)
      } else {
        // Fallback if API doesn't send pagination info (unlikely based on request)
        setHasMore(newProducts.length === productsPerPage)
      }

      // If API returns filters, seed UI filters only once
      if (data && data.filters && !hasSeededFiltersRef.current) {
        // Populate full lists from API metadata
        if (data.filters.categories) setCategoriesList(data.filters.categories)
        if (data.filters.subCategories) setSubCategoriesList(data.filters.subCategories)
        if (data.filters.brands) setBrandsList(data.filters.brands)
        if (data.filters.colors) setColorsList(data.filters.colors)
        if (data.filters.seasons) setSeasonsList(data.filters.seasons)

        // Only update price range based on actual data bounds
        const fetchedMaxPrice = data.filters.priceRange && data.filters.priceRange.maxPrice > 0 ? data.filters.priceRange.maxPrice : 15000;
        setMaxAvailablePrice(fetchedMaxPrice);
        const newPriceRange = data.filters.priceRange ? [data.filters.priceRange.minPrice || filters.priceRange[0], data.filters.priceRange.maxPrice || filters.priceRange[1]] : filters.priceRange

        // Don't auto-select categories, just update keys if needed or rely on categoriesList
        // setFilters updates triggered a re-fetch, which we want to avoid if possible or ensure is valid.

        setFilters((prev) => ({
          ...prev,
          priceRange: newPriceRange,
        }))
        hasSeededFiltersRef.current = true
      }

    } catch (err) {
      console.error(err)
      setProductsError(err.message)
    } finally {
      setProductsLoading(false)
    }
  }

  // Refetched when filters change (Replace mode)
  useEffect(() => {
    setCurrentPage(1)
    setProductsLoading(true) // Force loading state immediately
    setAllProducts([]) // Clear existing products to show the skeleton loader
    // Optional: Clear products to avoid mixing if we want a clean slate visual, 
    // but keeping them is usually better for UX until new ones arrive.
    // However, if the issue is "No products found" flashing, we want to ensure loading is true.
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchProducts(1, true)
  }, [filters, sortBy, searchQuery, productsPerPage])

  // Refetched when page changes (Append mode)
  useEffect(() => {
    if (currentPage > 1) {
      fetchProducts(currentPage, false)
    }
  }, [currentPage])

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !productsLoading) {
          setCurrentPage(prev => prev + 1)
        }
      },
      { threshold: 0.5 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, productsLoading])

  // Reflect current filters in the browser URL (so the GET request URL is visible)
  useEffect(() => {
    try {
      const params = new URLSearchParams()
      params.append('page', String(currentPage || 1))
      params.append('limit', String(productsPerPage || 12))
      if (searchQuery) params.append('search', searchQuery)
      if (filters.categories && filters.categories.length > 0) params.append('subCategory', filters.categories.join(','))
      if (filters.brands && filters.brands.length > 0) params.append('brand', filters.brands.join(','))
      if (filters.sizes && filters.sizes.length > 0) params.append('sizes', filters.sizes.join(','))
      if (filters.colors && filters.colors.length > 0) params.append('colors', filters.colors.join(','))
      if (filters.seasons && filters.seasons.length > 0) params.append('season', filters.seasons.join(','))
      if (filters.priceRange) {
        params.append('minPrice', String(filters.priceRange[0] || 0))
        params.append('maxPrice', String(filters.priceRange[1] || 0))
      }
      if (filters.rating) params.append('rating', String(filters.rating))
      if (filters.inStock) params.append('inStock', 'true')
      // special-case featured listing in URL
      if (sortBy === 'featured') {
        params.append('featured', 'true')
        params.set('limit', String(8))
      } else {
        // map UI sort option to backend sortBy + sortOrder for URL
        const mapSort = (s) => {
          switch (s) {
            case 'price-low':
              return { sortBy: 'price', sortOrder: 'asc' }
            case 'price-high':
              return { sortBy: 'price', sortOrder: 'desc' }
            case 'rating':
              return { sortBy: 'ratings', sortOrder: 'desc' }
            case 'newest':
              return { sortBy: 'createdAt', sortOrder: 'desc' }
            case 'popular':
              return { sortBy: 'numReviews', sortOrder: 'desc' }
            case 'recommended':
              return { sortBy: 'recommended', sortOrder: 'desc' }
            default:
              return { sortBy: 'featured', sortOrder: 'desc' }
          }
        }
        const sortParams = mapSort(sortBy)
        if (sortParams?.sortBy) params.append('sortBy', sortParams.sortBy)
        if (sortParams?.sortOrder) params.append('sortOrder', sortParams.sortOrder)
      }

      if (typeof window !== 'undefined') {
        const newUrl = `${window.location.pathname}?${params.toString()}`
        window.history.replaceState(null, '', newUrl)
      }
    } catch (e) {
      // ignore URL update errors
    }
  }, [currentPage, filters, sortBy, searchQuery, productsPerPage])



  // NOTE: In infinite scroll, we don't use client-side slicing. 
  // We just render 'allProducts' which accumulates pages.
  const currentProducts = allProducts

  const handleFilterChange = (filterType, value) => {
    // Special-case priceRange (it's an array [min, max]) and boolean/toggle filters
    if (filterType === "priceRange") {
      setFilters((prev) => ({ ...prev, priceRange: value }))
      return
    }

    // For toggles like inStock or rating which are primitives, just set directly
    if (!Array.isArray(filters[filterType])) {
      setFilters((prev) => ({ ...prev, [filterType]: value }))
      return
    }

    // For array filters (brands, categories, colors, sizes) toggle membership
    setFilters((prev) => {
      const current = prev[filterType] || []
      const exists = current.includes(value)
      return {
        ...prev,
        [filterType]: exists ? current.filter((item) => item !== value) : [...current, value],
      }
    })
  }

  const showToast = (message, type = "info") => {
    setToastMessage(message)
    setToastType(type)
    setToastVisible(true)
  }

  const handleAddToCart = async (product) => {
    // Check if user is logged in
    if (!user) {
      showToast("Please log in first", "info")
      return
    }

    // Check if user is a customer (brands cannot make orders)
    if (user.role === "brand") {
      showToast("Brands are not allowed to make orders. Please log in with a customer account.", "error")
      return
    }

    // If product requires size/color selection, redirect to product details page
    if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
      window.location.href = `/productDetails/${product.id}`
      return
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
      if (!token) {
        showToast("Please log in first", "info")
        return
      }

      const res = await fetch("/api/customer/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : null,
          color: product.colors && product.colors.length > 0 ? product.colors[0] : null,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        updateCartCount()
        showToast("Added to cart", "success")
      } else {
        showToast(data.error || "Failed to add item to cart", "error")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      showToast("An error occurred while adding to cart", "error")
    }
  }

  const toggleWishlist = async (productId) => {
    if (!user) {
      showToast("Please login", "error")
      return
    }

    // Optimistic update
    const previousWishlist = new Set(wishlist)
    setWishlist((prev) => {
      const newWishlist = new Set(prev)
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId)
      } else {
        newWishlist.add(productId)
      }
      return newWishlist
    })

    try {
      const uId = user._id || user.id
      const res = await fetch('/api/customer/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uId, productId })
      })
      const data = await res.json()
      if (!data.success) {
        setWishlist(previousWishlist) // Revert on fail
        showToast("Failed to update wishlist", "error")
      } else {
        // Optional: Toast success?
        // showToast(data.action === 'added' ? "Added to wishlist" : "Removed from wishlist", "success")
      }
    } catch (e) {
      setWishlist(previousWishlist)
      showToast("Error updating wishlist", "error")
    }
  }

  const clearFilters = () => {
    setFilters({
      brands: [],
      categories: [],
      priceRange: [0, maxAvailablePrice],
      sizes: [],
      colors: [],
      seasons: [],
      rating: 0,
      inStock: false,
    })
    setSearchQuery("")
  }

  const brands = [...new Set(allProducts.map((p) => p.brand))]
  const categories = [...new Set(allProducts.map((p) => p.category))]
  const colors = [...new Set(allProducts.flatMap((p) => p.colors))]

  // Fetch categories from backend (useful when server has its own category list)
  useEffect(() => {
    let mounted = true
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/customer/products/categories')
        if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`)
        const data = await res.json()
        if (!mounted) return
        if (data && Array.isArray(data.categories)) {
          // categories in response use `_id`/`name`; prefer `name` then `_id`
          const list = data.categories.map((c) => c.name || c._id).filter(Boolean)
          setCategoriesList(list)
        }
      } catch (err) {
        console.warn('Could not load categories from API:', err)
      }
    }
    fetchCategories()
    return () => { mounted = false }
  }, [])

  // Initialize user from localStorage so header shows avatar/logout when logged in
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
    }

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isProfileDropdownOpen])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    setUser(null)
    setIsProfileDropdownOpen(false)
    setIsLoginOpen(false)
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastNotification
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        type={toastType}
      />
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button & Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors transform translate-y-0.5">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:block font-medium">Back</span>
              </Link>
              <Link href="/">
                <img src="/logo.png" alt="SWAY Logo" className="h-[24px] w-auto" />
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <Link href="/cart" className="relative p-2 text-gray-600 hover:text-black transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 border-2 border-yellow-400 rounded-lg hover:bg-yellow-50 transition-colors bg-transparent"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-900">{user.name}</span>
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
                <div className="hidden md:flex items-center bg-gray-100/80 backdrop-blur-sm p-1 rounded-full border border-gray-200 hover:border-gray-300 transition-all shadow-sm">
                  <Link href="/login" className="px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-white hover:text-black hover:shadow-sm rounded-full transition-all">
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-yellow-400 text-black px-4 py-1.5 text-sm font-semibold rounded-full shadow-sm hover:bg-yellow-500 transition-all ml-1"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4">
          {/* Desktop Filters Sidebar */}
          <div className={`hidden lg:block w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={clearFilters} className="text-sm text-gray-600 hover:text-black transition-colors">
                  Clear All
                </button>
              </div>

              <FilterContent
                filters={filters}
                brands={brandsList.length > 0 ? brandsList : brands}
                categories={subCategoriesList}
                colors={colorsList.length > 0 ? colorsList : colors}
                seasons={seasonsList}
                maxAvailablePrice={maxAvailablePrice}
                onFilterChange={handleFilterChange}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-yellow-400 transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>

                  <div className="hidden lg:block text-sm text-gray-600">{allProducts.length} products found</div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    >
                      <option value="newest">Newest</option>
                      <option value="featured">Featured</option>
                      <option value="popular">Most Popular</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-600"}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow-sm" : "text-gray-600"}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid/List */}
              {currentProducts.length > 0 ? (
                <>
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4"
                        : "space-y-4"
                    }
                  >
                    {currentProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                        isWishlisted={wishlist.has(product.id)}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={toggleWishlist}
                      />
                    ))}
                  </div>

                  {/* Infinite Scroll Loader & Sentinel */}
                  {hasMore && (
                    <div ref={observerTarget} className="flex justify-center items-center py-8">
                      {productsLoading && <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />}
                    </div>
                  )}

                  {!hasMore && allProducts.length > 0 && (
                    <div className="text-center py-8 text-gray-500">
                      You've reached the end of the list
                    </div>
                  )}
                </>
              ) : productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
                      <div className="h-72 bg-gray-200"></div>
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
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                  <button
                    onClick={clearFilters}
                    className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <FilterContent
                filters={filters}
                brands={brandsList.length > 0 ? brandsList : brands}
                categories={subCategoriesList}
                colors={colorsList.length > 0 ? colorsList : colors}
                seasons={seasonsList}
                maxAvailablePrice={maxAvailablePrice}
                onFilterChange={handleFilterChange}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={clearFilters}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 bg-yellow-400 text-black py-3 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}

// Filter Content Component
function FilterContent({ filters, brands, categories, colors, seasons, maxAvailablePrice, onFilterChange, sortBy, setSortBy }) {
  const [brandSearch, setBrandSearch] = useState("")
  const [categorySearch, setCategorySearch] = useState("")

  const filteredBrands = brands
    .filter((b) => b && typeof b === 'string' && b.trim() !== "" && b.toLowerCase().includes(brandSearch.toLowerCase()))
    .sort((a, b) => a.localeCompare(b))

  const filteredCategories = categories
    .filter((c) => c && typeof c === 'string' && c.trim() !== "" && c.toLowerCase().includes(categorySearch.toLowerCase()))
    .sort((a, b) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      {/* Brands */}
      <div>
        <h3 className="font-semibold mb-3">Brands</h3>
        <div className="mb-2 relative">
          <input
            type="text"
            placeholder="Search brands..."
            className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-400"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
          />
          <Search className="absolute right-2 top-1.5 w-3 h-3 text-gray-400" />
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {filteredBrands.map((brand) => {
            const isChecked = filters.brands.includes(brand)
            return (
              <label key={brand} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded group">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onFilterChange("brands", brand)}
                  className="sr-only"
                />
                <div className={`mr-3 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isChecked ? "bg-yellow-400 border-yellow-400" : "border-gray-300 bg-white group-hover:border-gray-400"}`}>
                  {isChecked && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                </div>
                <span className={`text-sm truncate ${isChecked ? "font-medium text-black" : "text-gray-600"}`} title={brand}>{brand}</span>
              </label>
            )
          })}
          {filteredBrands.length === 0 && <p className="text-xs text-gray-500">No brands found</p>}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="mb-2 relative">
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-400"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
          />
          <Search className="absolute right-2 top-1.5 w-3 h-3 text-gray-400" />
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {filteredCategories.map((category) => {
            const isChecked = filters.categories.includes(category)
            return (
              <label key={category} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded group">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onFilterChange("categories", category)}
                  className="sr-only"
                />
                <div className={`mr-3 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isChecked ? "bg-yellow-400 border-yellow-400" : "border-gray-300 bg-white group-hover:border-gray-400"}`}>
                  {isChecked && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                </div>
                <span className={`text-sm capitalize truncate ${isChecked ? "font-medium text-black" : "text-gray-600"}`} title={category}>{category}</span>
              </label>
            )
          })}
          {filteredCategories.length === 0 && <p className="text-xs text-gray-500">No categories found</p>}
        </div>
      </div>

      {/* Seasons */}
      <div>
        <h3 className="font-semibold mb-3">Seasons</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {(seasons || []).filter(s => s && typeof s === 'string' && s.trim() !== "").map((season) => {
            const isChecked = filters.seasons.includes(season)
            return (
              <label key={season} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded group">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onFilterChange("seasons", season)}
                  className="sr-only"
                />
                <div className={`mr-3 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isChecked ? "bg-yellow-400 border-yellow-400" : "border-gray-300 bg-white group-hover:border-gray-400"}`}>
                  {isChecked && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                </div>
                <span className={`text-sm capitalize truncate ${isChecked ? "font-medium text-black" : "text-gray-600"}`} title={season}>{season}</span>
              </label>
            )
          })}
          {(!seasons || seasons.length === 0) && <p className="text-xs text-gray-500">No seasons found</p>}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <input
          type="range"
          min="0"
          max={maxAvailablePrice || 15000}
          // Dynamic maximum price from the backend products collection
          value={filters.priceRange[1]}
          onChange={(e) => onFilterChange("priceRange", [0, Number.parseInt(e.target.value)])}
          className="w-full accent-yellow-400"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>PKR 0</span>
          <span>PKR {filters.priceRange[1].toLocaleString()}</span>
        </div>


      </div>

      {/* Colors */}
      <div>
        <h3 className="font-semibold mb-3">Colors</h3>
        <div className="flex flex-wrap gap-3">
          {(() => {
            const visibleColors = colors.filter(c => c && typeof c === 'string' && c.trim() !== "");
            if (visibleColors.length === 0) {
              return <p className="text-xs text-gray-500 w-full text-center py-2">No colors found</p>;
            }
            return visibleColors.map((color) => {
              // Handle basic color mapping for display
              let bgStyle = { backgroundColor: color }
              if (color.toLowerCase() === 'multicolor') bgStyle = { background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' }

              const isSelected = filters.colors.includes(color)

              return (
                <label
                  key={color}
                  className="cursor-pointer"
                  title={color}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onFilterChange("colors", color)}
                    className="sr-only"
                  />
                  <div
                    className={`w-8 h-8 rounded-full border-2 border-white ring-1 transition-all ${isSelected ? 'ring-2 ring-yellow-400 outline outline-2 outline-white scale-110 shadow-sm' : 'ring-gray-200 hover:ring-gray-400'}`}
                    style={bgStyle}
                  />
                </label>
              )
            })
          })()}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center">
              <input
                type="checkbox"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => onFilterChange("rating", filters.rating === rating ? 0 : rating)}
                className="mr-3"
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
                <span className="text-sm ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>


    </div>
  )
}

// Product Card Component
function ProductCard({ product, viewMode, isWishlisted, onAddToCart, onToggleWishlist }) {
  if (viewMode === "list") {
    return (
      <Link href={`/productDetails/${product.id}`} className="block">
        <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{product.rating}</span>
                  </div>
                  <span className="text-sm text-gray-400">({product.reviews} reviews)</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold">PKR {product.price.toLocaleString()}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      PKR {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onToggleWishlist(product.id)
                    }}
                    className={`p-2 rounded-lg transition-colors ${isWishlisted ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onAddToCart(product)
                    }}
                    disabled={!product.inStock}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/productDetails/${product.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isSponsored && (
              <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold shadow-sm">Sponsored</span>
            )}
            {!product.inStock && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm">Out of Stock</span>
            )}
            {product.originalPrice > product.price && (
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleWishlist(product.id)
            }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isWishlisted ? "bg-red-500 text-white" : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white"
              }`}
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-400">({product.reviews})</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-600">{product.brand}</span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">PKR {product.price.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">PKR {product.originalPrice.toLocaleString()}</span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToCart(product)
            }}
            disabled={!product.inStock}
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </Link>
  )
}

// Helper function for color classes
function getColorClass(color) {
  const colorMap = {
    black: "bg-black border-gray-300",
    white: "bg-white border-gray-300",
    grey: "bg-gray-500 border-gray-300",
    blue: "bg-blue-500 border-blue-300",
    yellow: "bg-yellow-400 border-yellow-300",
    brown: "bg-amber-600 border-amber-300",
    pink: "bg-pink-400 border-pink-300",
  }
  return colorMap[color] || "bg-gray-400 border-gray-300"
}
