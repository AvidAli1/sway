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
} from "lucide-react"
import Link from "next/link"

export default function ProductsPage() {
  const [user, setUser] = useState(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [viewMode, setViewMode] = useState("grid") // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [wishlist, setWishlist] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12)
  const [categoriesList, setCategoriesList] = useState([])

  const [filters, setFilters] = useState({
    brands: [],
    categories: [],
    priceRange: [0, 15000],
    sizes: [],
    colors: [],
    rating: 0,
    inStock: false,
  })

  // Product data loaded from backend
  const [allProducts, setAllProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState(null)
  const lastFetchParamsRef = useRef(null)
  const hasSeededFiltersRef = useRef(false)

  // Fetch products from backend API (server-side filtering)
  useEffect(() => {
    let mounted = true
    const buildParamsString = (filt) => {
      // special-case: when user selects "featured" we want a short featured-only request
      if (sortBy === 'featured') {
        const p = new URLSearchParams()
        p.append('featured', 'true')
        p.append('limit', String(8))
        return p.toString()
      }
      const params = new URLSearchParams()
      params.append('page', String(currentPage || 1))
      params.append('limit', String(productsPerPage || 12))
  if (searchQuery) params.append('search', searchQuery)
      if (filt.categories && filt.categories.length > 0) params.append('category', filt.categories.join(','))
      if (filt.brands && filt.brands.length > 0) params.append('brands', filt.brands.join(','))
      if (filt.sizes && filt.sizes.length > 0) params.append('sizes', filt.sizes.join(','))
      if (filt.colors && filt.colors.length > 0) params.append('colors', filt.colors.join(','))
      if (filt.priceRange) {
        params.append('minPrice', String(filt.priceRange[0] || 0))
        params.append('maxPrice', String(filt.priceRange[1] || 0))
      }
      if (filt.rating) params.append('rating', String(filt.rating))
      if (filt.inStock) params.append('inStock', 'true')
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
          default:
            return { sortBy: 'featured', sortOrder: 'desc' }
        }
      }
      const sortParams = mapSort(sortBy)
      if (sortParams?.sortBy) params.append('sortBy', sortParams.sortBy)
      if (sortParams?.sortOrder) params.append('sortOrder', sortParams.sortOrder)
      return params.toString()
    }

    const fetchProducts = async () => {
      setProductsLoading(true)
      setProductsError(null)
      try {
        const paramsString = buildParamsString(filters)

        // If the params haven't changed since last fetch, skip (prevents duplicate calls)
        if (lastFetchParamsRef.current === paramsString) {
          return
        }

        const url = `/api/customer/products?${paramsString}`
        console.debug('Fetching products with URL:', url)

        const res = await fetch(url)
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
        const data = await res.json()
        if (!mounted) return

        // Normalize server products to UI shape
        setAllProducts((data && Array.isArray(data.products)) ? data.products.map(p => ({
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
        })) : [])

        // If API returns filters, seed UI filters only once (to avoid refetch loop)
        if (data && data.filters && !hasSeededFiltersRef.current) {
          const newCategories = data.filters.categories || []
          const newPriceRange = data.filters.priceRange ? [data.filters.priceRange.minPrice || filters.priceRange[0], data.filters.priceRange.maxPrice || filters.priceRange[1]] : filters.priceRange
          setFilters((prev) => ({
            ...prev,
            categories: newCategories.length > 0 ? newCategories : prev.categories,
            priceRange: newPriceRange,
          }))

          // After seeding filters, compute the params string that would result and set as lastFetched
          const seededFilters = { ...filters, categories: newCategories.length > 0 ? newCategories : filters.categories, priceRange: newPriceRange }
          lastFetchParamsRef.current = buildParamsString(seededFilters)
          hasSeededFiltersRef.current = true
        } else {
          // normal path: mark this paramsString as last fetched
          lastFetchParamsRef.current = paramsString
        }

      } catch (err) {
        console.error(err)
        setProductsError(err.message)
      } finally {
        setProductsLoading(false)
      }
    }

    fetchProducts()
    return () => { mounted = false }
  }, [currentPage, filters, sortBy, searchQuery, productsPerPage])

  // Reflect current filters in the browser URL (so the GET request URL is visible)
  useEffect(() => {
    try {
      const params = new URLSearchParams()
      params.append('page', String(currentPage || 1))
      params.append('limit', String(productsPerPage || 12))
  if (searchQuery) params.append('search', searchQuery)
      if (filters.categories && filters.categories.length > 0) params.append('category', filters.categories.join(','))
      if (filters.brands && filters.brands.length > 0) params.append('brands', filters.brands.join(','))
      if (filters.sizes && filters.sizes.length > 0) params.append('sizes', filters.sizes.join(','))
      if (filters.colors && filters.colors.length > 0) params.append('colors', filters.colors.join(','))
      if (filters.priceRange) {
        params.append('minPrice', String(filters.priceRange[0] || 0))
        params.append('maxPrice', String(filters.priceRange[1] || 0))
      }
      if (filters.rating) params.append('rating', String(filters.rating))
      if (filters.inStock) params.append('inStock', 'true')
      // special-case featured listing in URL: show featured=true&limit=8
      if (sortBy === 'featured') {
        params.append('featured', 'true')
        params.append('limit', String(8))
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

  const [filteredProducts, setFilteredProducts] = useState(allProducts)

  // When server returns products, use them directly (server-side filtered)
  useEffect(() => {
    setFilteredProducts(allProducts)
    setCurrentPage(1)
  }, [allProducts])

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

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

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id)
      if (existingItem) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev)
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId)
      } else {
        newWishlist.add(productId)
      }
      return newWishlist
    })
  }

  const clearFilters = () => {
    setFilters({
      brands: [],
      categories: [],
      priceRange: [0, 15000],
      sizes: [],
      colors: [],
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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button & Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:block font-medium">Back</span>
              </Link>
              <img src="/logo2.png" alt="SWAY Logo" className="h-7 w-auto mt-2" />
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
              <button className="relative p-2 text-gray-600 hover:text-black transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-black">{user.name?.[0] || "U"}</span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user.name}</span>
                  <button
                    onClick={() => {
                      localStorage.removeItem("user")
                      localStorage.removeItem("authToken")
                      setUser(null)
                      // optional: close login modal if open
                      setIsLoginOpen(false)
                    }}
                    className="text-gray-600 hover:text-red-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-8">
        <div className="flex gap-4">
          {/* Desktop Filters Sidebar */}
          <div className={`hidden lg:block w-64 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={clearFilters} className="text-sm text-gray-600 hover:text-black transition-colors">
                  Clear All
                </button>
              </div>

              <FilterContent
                filters={filters}
                brands={brands}
                categories={categoriesList.length > 0 ? categoriesList : categories}
                colors={colors}
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

                  <div className="hidden lg:block text-sm text-gray-600">{filteredProducts.length} products found</div>
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-yellow-400 transition-colors"
                      >
                        Previous
                      </button>

                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`px-4 py-2 rounded-lg transition-colors ${currentPage === index + 1
                              ? "bg-yellow-400 text-black"
                              : "border border-gray-300 hover:border-yellow-400"
                            }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-yellow-400 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
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
                brands={brands}
                categories={categoriesList.length > 0 ? categoriesList : categories}
                colors={colors}
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

// Filter Content Component
function FilterContent({ filters, brands, categories, colors, onFilterChange, sortBy, setSortBy }) {
  return (
    <div className="space-y-6">
      {/* Brands */}
      <div>
        <h3 className="font-semibold mb-3">Brands</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => onFilterChange("brands", brand)}
                className="mr-3 rounded"
              />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => onFilterChange("categories", category)}
                className="mr-3 rounded"
              />
              <span className="text-sm capitalize">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <input
          type="range"
          min="0"
          max="15000"
          value={filters.priceRange[1]}
          onChange={(e) => onFilterChange("priceRange", [0, Number.parseInt(e.target.value)])}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>PKR 0</span>
          <span>PKR {filters.priceRange[1].toLocaleString()}</span>
        </div>

        
      </div>

      {/* Colors */}
      <div>
        <h3 className="font-semibold mb-3">Colors</h3>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <label
              key={color}
              className={`flex flex-col items-center gap-1 p-2 border rounded-lg cursor-pointer transition-colors ${filters.colors.includes(color) ? "border-yellow-400 bg-yellow-50" : "border-gray-200"
                }`}
            >
              <input
                type="checkbox"
                checked={filters.colors.includes(color)}
                onChange={() => onFilterChange("colors", color)}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-full border-2 ${getColorClass(color)}`} />
              <span className="text-xs capitalize">{color}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => onFilterChange("rating", rating)}
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

      {/* In Stock */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={() => onFilterChange("inStock", !filters.inStock)}
            className="mr-3 rounded"
          />
          <span className="text-sm">In Stock Only</span>
        </label>
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
                  {product.originalPrice && (
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
              <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold">Sponsored</span>
            )}
            {!product.inStock && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">Out of Stock</span>
            )}
            {product.originalPrice && (
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
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
            {product.originalPrice && (
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
