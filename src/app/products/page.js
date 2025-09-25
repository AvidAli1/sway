"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import Link from "next/link"

export default function ProductsPage() {
  const [user, setUser] = useState(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [viewMode, setViewMode] = useState("grid") // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [wishlist, setWishlist] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12)

  const [filters, setFilters] = useState({
    brands: [],
    categories: [],
    priceRange: [0, 15000],
    sizes: [],
    colors: [],
    rating: 0,
    inStock: false,
  })

  // Comprehensive product data
  const [allProducts] = useState([
    {
      id: 1,
      title: "Premium Cotton Hoodie",
      brand: "Urban Style",
      price: 4500,
      originalPrice: 5500,
      image: "/products_page/premium_hoodie.jpg",
      category: "tops",
      sizes: ["S", "M", "L", "XL"],
      colors: ["yellow", "black", "white"],
      rating: 4.8,
      reviews: 124,
      description: "Comfortable premium cotton hoodie perfect for casual wear",
      inStock: true,
      isSponsored: true,
      tags: ["trending", "new"],
    },
    {
      id: 2,
      title: "Vintage Denim Jacket",
      brand: "Street Wear",
      price: 6200,
      image: "/products_page/vintage_denim_jacket.jpg",
      category: "jackets",
      sizes: ["M", "L", "XL"],
      colors: ["blue", "black"],
      rating: 4.6,
      reviews: 89,
      description: "Classic vintage-style denim jacket with modern fit",
      inStock: true,
      isSponsored: true,
      tags: ["vintage", "classic"],
    },
    {
      id: 3,
      title: "Casual White Sneakers",
      brand: "Comfort Walk",
      price: 3800,
      image: "/products_page/casual_white_sneakers.jpg",
      category: "shoes",
      sizes: ["7", "8", "9", "10", "11"],
      colors: ["white", "grey"],
      rating: 4.7,
      reviews: 156,
      description: "Comfortable everyday sneakers with premium cushioning",
      inStock: true,
      tags: ["comfort", "casual"],
    },
    {
      id: 4,
      title: "Oversized T-Shirt",
      brand: "Retro Vibes",
      price: 2200,
      image: "/products_page/oversized_tshirt.jpg",
      category: "tops",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["black", "white", "grey", "yellow"],
      rating: 4.5,
      reviews: 203,
      description: "Trendy oversized t-shirt with soft cotton blend",
      inStock: true,
      tags: ["oversized", "trendy"],
    },
    {
      id: 5,
      title: "Slim Fit Jeans",
      brand: "Elite Fashion",
      price: 5800,
      image: "/products_page/slim_fit_jeans.jpg",
      category: "bottoms",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["blue", "black"],
      rating: 4.9,
      reviews: 78,
      description: "Premium slim fit jeans with stretch comfort",
      inStock: true,
      tags: ["premium", "slim-fit"],
    },
    {
      id: 6,
      title: "Summer Floral Dress",
      brand: "Chic Styles",
      price: 4200,
      image: "/products_page/summer_floral_dress.jpg",
      category: "dresses",
      sizes: ["XS", "S", "M", "L"],
      colors: ["yellow", "white", "pink"],
      rating: 4.4,
      reviews: 92,
      description: "Beautiful floral print dress perfect for summer",
      inStock: true,
      tags: ["summer", "floral"],
    },
    {
      id: 7,
      title: "Leather Crossbody Bag",
      brand: "Luxury Goods",
      price: 7500,
      image: "/products_page/leather_crossbody_bag.jpg",
      category: "accessories",
      sizes: ["One Size"],
      colors: ["brown", "black"],
      rating: 4.8,
      reviews: 45,
      description: "Premium leather crossbody bag with multiple compartments",
      inStock: false,
      tags: ["luxury", "leather"],
    },
    {
      id: 8,
      title: "Athletic Running Shoes",
      brand: "Sport Pro",
      price: 4900,
      image: "/products_page/athletic_running_shoes.jpg",
      category: "shoes",
      sizes: ["7", "8", "9", "10", "11", "12"],
      colors: ["black", "white", "grey"],
      rating: 4.6,
      reviews: 134,
      description: "High-performance running shoes with advanced cushioning",
      inStock: true,
      tags: ["athletic", "performance"],
    },
    {
      id: 9, title: "Floral Button-Up Shirt",
      brand: "Tropical Wear",
      price: 3500,
      image: ["/virtual_tryon/buttonup_shirt.jpg"],
      category: "tops",
      sizes: ["S", "M", "L", "XL"],
      colors: ["white", "multicolor"],
      rating: 4.6,
      reviews: 54,
      description: "Lightweight floral button-up shirt perfect for summer. Features a relaxed fit with breathable fabric and tropical-inspired print.",
      specifications: { Material: "100% Cotton", Fit: "Relaxed Fit", Care: "Machine wash cold, hang dry", Origin: "Made in Pakistan", Style: "Short-Sleeve Casual Shirt", },
      inStock: true,
      stockCount: 20,
      tags: ["summer", "casual", "floral"],
    },
    {
      id: 10,
      title: "Graphic Print Hoodie",
      brand: "Street Art",
      price: 3900,
      image: "/products_page/graphic_print_hoodie.jpg",
      category: "tops",
      sizes: ["M", "L", "XL"],
      colors: ["black", "white"],
      rating: 4.3,
      reviews: 88,
      description: "Unique graphic print hoodie with artistic design",
      inStock: true,
      tags: ["graphic", "artistic"],
    },
    {
      id: 11,
      title: "High-Waisted Jeans",
      brand: "Denim Co",
      price: 5200,
      image: "/products_page/high_waisted_jeans.jpg",
      category: "bottoms",
      sizes: ["26", "28", "30", "32"],
      colors: ["blue", "black"],
      rating: 4.6,
      reviews: 112,
      description: "Flattering high-waisted jeans with vintage wash",
      inStock: true,
      tags: ["high-waist", "vintage"],
    },
    {
      id: 12,
      title: "Minimalist Watch",
      brand: "Time Piece",
      price: 6800,
      image: "/products_page/minimalistic_watch.jpg",
      category: "accessories",
      sizes: ["One Size"],
      colors: ["black", "white", "brown"],
      rating: 4.9,
      reviews: 234,
      description: "Elegant minimalist watch with leather strap",
      inStock: true,
      tags: ["minimalist", "elegant"],
    },
  ])

  const [filteredProducts, setFilteredProducts] = useState(allProducts)

  // Filter and search products
  useEffect(() => {
    let filtered = allProducts

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter((product) => filters.brands.includes(product.brand))
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) => filters.categories.includes(product.category))
    }

    // Price filter
    filtered = filtered.filter(
      (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1],
    )

    // Color filter
    if (filters.colors.length > 0) {
      filtered = filtered.filter((product) => product.colors.some((color) => filters.colors.includes(color)))
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter((product) => product.rating >= filters.rating)
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter((product) => product.inStock)
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        filtered.sort((a, b) => b.id - a.id)
        break
      case "popular":
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
      default:
        // Featured - sponsored first, then by rating
        filtered.sort((a, b) => {
          if (a.isSponsored && !b.isSponsored) return -1
          if (!a.isSponsored && b.isSponsored) return 1
          return b.rating - a.rating
        })
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [searchQuery, filters, sortBy, allProducts])

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]:
        prev[filterType].includes && prev[filterType].includes(value)
          ? prev[filterType].filter((item) => item !== value)
          : Array.isArray(prev[filterType])
            ? [...prev[filterType], value]
            : value,
    }))
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
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-black">{user.name?.[0] || "U"}</span>
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
                categories={categories}
                colors={colors}
                onFilterChange={handleFilterChange}
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
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
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
                categories={categories}
                colors={colors}
                onFilterChange={handleFilterChange}
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
function FilterContent({ filters, brands, categories, colors, onFilterChange }) {
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
