"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ShoppingCart, Container, X, Filter } from "lucide-react"
import Link from "next/link"
import SwipeInterface from "./components/SwipeInterface"
import SwipeBucketModal from "./components/SwipeBucketModal"

export default function SwipePage() {
  const [user, setUser] = useState(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [bucketItems, setBucketItems] = useState([])
  const [showBucketModal, setShowBucketModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    brands: [],
    categories: [],
    priceRange: [0, 10000],
    sizes: [],
    colors: [],
  })

  const [allProducts] = useState([
    {
      id: 1,
      title: "Premium Cotton Hoodie",
      brand: "Urban Style",
      price: 4500,
      originalPrice: 5500,
      image: "/landing_page_products/premium_hoodie.jpg",
      category: "tops",
      sizes: ["S", "M", "L", "XL"],
      colors: ["yellow", "black", "white"],
      rating: 4.8,
      description: "Comfortable premium cotton hoodie perfect for casual wear",
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
      description: "Classic vintage-style denim jacket with modern fit",
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
      description: "Comfortable everyday sneakers with premium cushioning",
    },
    {
      id: 4,
      title: "Oversized T-Shirt",
      brand: "Retro Vibes",
      price: 2200,
      image: "/products_page/oversized_tshirt2.jpg",
      category: "tops",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["black", "white", "grey", "yellow"],
      rating: 4.5,
      description: "Trendy oversized t-shirt with soft cotton blend",
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
      description: "Premium slim fit jeans with stretch comfort",
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
      description: "Beautiful floral print dress perfect for summer",
    },
    {
      id: 7,
      title: "Leather Crossbody Bag",
      brand: "Luxury Goods",
      price: 7500,
      image: "/products_page/leather_crossbody_bag2.jpg",
      category: "accessories",
      sizes: ["One Size"],
      colors: ["brown", "black"],
      rating: 4.8,
      description: "Premium leather crossbody bag with multiple compartments",
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
      description: "High-performance running shoes with advanced cushioning",
    },
  ])

  const [filteredProducts, setFilteredProducts] = useState(allProducts)

  useEffect(() => {
    let filtered = allProducts

    if (filters.brands.length > 0) {
      filtered = filtered.filter((product) => filters.brands.includes(product.brand))
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) => filters.categories.includes(product.category))
    }

    filtered = filtered.filter(
      (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1],
    )

    if (filters.colors.length > 0) {
      filtered = filtered.filter((product) => product.colors.some((color) => filters.colors.includes(color)))
    }

    setFilteredProducts(filtered)
  }, [filters, allProducts])

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id)
      if (existingItem) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setCartCount((prev) => prev + 1)
  }

  const handleAddToBucket = (product) => {
    setBucketItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id)
      if (existingItem) {
        return prev // Don't add duplicates
      }
      return [...prev, product]
    })
  }

  const handleRemoveFromBucket = (productId) => {
    setBucketItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }))
  }

  const clearFilters = () => {
    setFilters({
      brands: [],
      categories: [],
      priceRange: [0, 10000],
      sizes: [],
      colors: [],
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium hidden sm:block mr-4">Back</span>
              </Link>
            </div>

            <div className="flex-1 flex justify-left sm:justify-left justify-start sm:ml-0">
              <h1 className="text-xl font-bold text-black">
                S<span className="text-yellow-400">W</span>AY
              </h1>
            </div>

            <div className="flex items-center space-x-4 sm:space-x-6">
              <button
                onClick={() => setShowFilters(true)}
                className="p-2 text-gray-600 hover:text-black transition-colors"
                aria-label="Filters"
              >
                <Filter className="w-5 h-5" />
              </button>

              <button
                className="relative p-2 text-gray-600 hover:text-black transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-semibold text-black">{user.name?.[0] || "U"}</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-black text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-gray-800 transition-colors text-xs sm:text-sm font-medium"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Discover Your Style</h2>
          <p className="text-gray-600 mb-4">Swipe up for cart, right for bucket, left to pass</p>

          <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
            <span>{filteredProducts.length} products available</span>
            <span>•</span>
            <span>{cartCount} items in cart</span>
            <span>•</span>
            <span>{bucketItems.length} in bucket</span>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <SwipeInterface products={filteredProducts} onAddToCart={handleAddToCart} onAddToBucket={handleAddToBucket} />
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products match your filters</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters to see more products</p>
            <button
              onClick={clearFilters}
              className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link href="/products" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">
            Prefer traditional browsing? View all products →
          </Link>
        </div>
      </div>

      <button
        onClick={() => setShowBucketModal(true)}
        className="fixed right-6 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center z-30"
        aria-label="Open swipe bucket"
      >
        <div className="relative">
          <Container className="w-6 h-6" />
          {bucketItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {bucketItems.length}
            </span>
          )}
        </div>
      </button>

      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)} />
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto relative">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Filter Products</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Brands</h3>
                <div className="space-y-2">
                  {["Urban Style", "Street Wear", "Comfort Walk", "Elite Fashion", "Retro Vibes", "Chic Styles"].map(
                    (brand) => (
                      <label key={brand} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={() => handleFilterChange("brands", brand)}
                          className="mr-3 rounded"
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  {["tops", "bottoms", "shoes", "jackets", "dresses", "accessories"].map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleFilterChange("categories", category)}
                        className="mr-3 rounded"
                      />
                      <span className="text-sm capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Colors</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: "Black", value: "black" },
                    { name: "White", value: "white" },
                    { name: "Grey", value: "grey" },
                    { name: "Blue", value: "blue" },
                    { name: "Yellow", value: "yellow" },
                    { name: "Brown", value: "brown" },
                  ].map((color) => (
                    <label
                      key={color.value}
                      className={`flex flex-col items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                        filters.colors.includes(color.value) ? "border-yellow-400 bg-yellow-50" : "border-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color.value)}
                        onChange={() => handleFilterChange("colors", color.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-6 h-6 rounded-full border-2 ${
                          color.value === "black"
                            ? "bg-black border-gray-300"
                            : color.value === "white"
                              ? "bg-white border-gray-300"
                              : color.value === "grey"
                                ? "bg-gray-500 border-gray-300"
                                : color.value === "blue"
                                  ? "bg-blue-500 border-blue-300"
                                  : color.value === "yellow"
                                    ? "bg-yellow-400 border-yellow-300"
                                    : "bg-amber-600 border-amber-300"
                        }`}
                      />
                      <span className="text-xs">{color.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, priceRange: [0, Number.parseInt(e.target.value)] }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>PKR 0</span>
                  <span>PKR {filters.priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 bg-yellow-400 text-black py-3 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SwipeBucketModal
        isOpen={showBucketModal}
        onClose={() => setShowBucketModal(false)}
        bucketItems={bucketItems}
        onAddToCart={handleAddToCart}
        onRemoveFromBucket={handleRemoveFromBucket}
      />
    </div>
  )
}
