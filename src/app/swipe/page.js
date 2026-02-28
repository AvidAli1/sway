"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, ShoppingCart, Container, X, Filter, User, ChevronDown, LayoutDashboard, LogOut } from "lucide-react"
import Link from "next/link"
import SwipeInterface from "./components/SwipeInterface"
import SwipeBucketModal from "./components/SwipeBucketModal"
import ToastNotification from "../components/ToastNotification"
import { useRouter } from "next/navigation"
import { useCart } from "../context/CartContext"

export default function SwipePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const [toastMessage, setToastMessage] = useState("")
  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState("info")
  const [cartItems, setCartItems] = useState([])
  const { cartCount, updateCartCount } = useCart()
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

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [userId, setUserId] = useState(null) // Track userId for passing to API if needed

  // Restore user session
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        const sessionUser = parsed.user || parsed;
        setUser(sessionUser)
        setUserId(sessionUser.id || sessionUser._id);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, [])

  const fetchProducts = async (pageNumber, isNewFilter = false) => {
    // Avoid fetching if already loading or no more data (unless it's a new filter reset)
    if (loading && !isNewFilter) return;

    setLoading(true)
    try {
      const params = new URLSearchParams();
      params.append('page', pageNumber);
      params.append('limit', '5'); // Fetch small batches as requested
      params.append('status', 'active');
      params.append('inStock', 'true');

      if (filters.brands.length > 0) params.append('brand', filters.brands.join(','));
      if (filters.categories.length > 0) params.append('category', filters.categories.join(','));
      if (filters.colors.length > 0) params.append('colors', filters.colors.join(','));

      params.append('minPrice', filters.priceRange[0]);
      params.append('maxPrice', filters.priceRange[1]);

      let headers = {};
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Failed to retrieve token:", e);
      }

      const res = await fetch(`/api/customer/products?${params.toString()}`, { headers, credentials: 'include' });
      const data = await res.json();

      if (data.success) {
        const mappedProducts = data.products.map(p => ({
          id: p._id,
          title: p.name,
          brand: p.brand?.name || p.brand || '',
          price: p.price,
          originalPrice: p.originalPrice,
          image: p.thumbnail?.SD || p.images?.[0]?.SD || '/placeholder.svg',
          category: p.category,
          sizes: p.sizes || [],
          colors: p.colors || [],
          rating: p.ratings || 0,
          reviews: p.numReviews || 0,
          description: p.description || '',
          inStock: !!p.inStock,
          isSponsored: !!p.isFeatured,
          tags: p.tags || [],
        }));

        if (isNewFilter) {
          setProducts(mappedProducts);
        } else {
          setProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNew = mappedProducts.filter(p => !existingIds.has(p.id));
            return [...prev, ...uniqueNew];
          });
        }
        setHasMore(data.pagination.hasNextPage);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and Filter change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true);
  }, [filters]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  };

  const showToast = (message, type = "info") => {
    setToastMessage(message)
    setToastType(type)
    setToastVisible(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    setUser(null)
    setIsProfileDropdownOpen(false)
    router.push("/login")
  }

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
        // Update cart count via context
        updateCartCount()
      } else {
        showToast(data.error || "Failed to add item to cart", "error")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      showToast("An error occurred while adding to cart", "error")
    }
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
      <ToastNotification
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        type={toastType}
      />
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors transform translate-y-0.5">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium hidden sm:block mr-4">Back</span>
              </Link>
            </div>

            <div className="flex-1 flex justify-left sm:justify-left justify-start sm:ml-0">
              <h1 className="text-xl font-bold text-black">
                <img src="/logo.png" alt="SWAY Logo" className="h-6 w-auto" />
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

              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-black transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
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
                    className="flex items-center space-x-2 px-2 py-1 sm:px-3 sm:py-2 border-2 border-yellow-400 rounded-lg hover:bg-yellow-50 transition-colors bg-white sm:min-w-[140px]"
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-900 truncate max-w-[100px]">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        href="/customerDashboard"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-yellow-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center bg-gray-100/80 backdrop-blur-sm p-1 rounded-full border border-gray-200 hover:border-gray-300 transition-all shadow-sm">
                  <Link href="/login" className="px-3 py-1.5 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-white hover:text-black hover:shadow-sm rounded-full transition-all">
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-yellow-400 text-black px-3 py-1.5 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-full shadow-sm hover:bg-yellow-500 transition-all ml-1"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="md:max-w-4xl md:mx-auto md:px-4 md:sm:px-6 md:lg:px-8 py-0 md:py-8 h-[calc(100dvh-64px)] md:h-auto overflow-hidden md:overflow-visible flex flex-col">
        <div className="hidden md:block text-center mb-8 shrink-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Discover Your Style</h2>
          <p className="text-gray-600 mb-4">Swipe up for cart, right for bucket, left to pass</p>

          <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
            <span>{products.length} loaded</span>
            <span>•</span>
            <span>{cartCount} items in cart</span>
            <span>•</span>
            <span>{bucketItems.length} in bucket</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative w-full flex justify-center">
          {loading && products.length === 0 ? (
            <div className="flex items-center justify-center h-[calc(100vh-200px)] w-full max-w-sm mx-auto px-4 mt-6">
              <div className="animate-pulse bg-white rounded-[2rem] shadow-xl border border-gray-100 w-full h-[85vh] md:h-[600px] relative overflow-hidden flex flex-col">
                <div className="flex-1 bg-gray-200"></div>
                <div className="w-full absolute bottom-0 bg-white/90 backdrop-blur-sm p-6 pt-16 space-y-3">
                  <div className="h-6 w-1/4 bg-gray-300 rounded-full mb-2"></div>
                  <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                </div>
                <div className="absolute bottom-[100px] right-6 h-12 w-12 bg-white rounded-full shadow-lg z-10"></div>
              </div>
            </div>
          ) : products.length > 0 ? (
            <SwipeInterface
              products={products}
              onAddToCart={handleAddToCart}
              onAddToBucket={handleAddToBucket}
              cartCount={cartCount}
              bucketItems={bucketItems}
              user={user}
              showToast={showToast}
              onReachEnd={handleLoadMore}
            />
          ) : (
            <div className="text-center py-16 w-full">
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
        </div>

        <div className="mt-8 flex justify-center hidden md:flex shrink-0">
          <Link href="/products" className="text-gray-600 hover:text-black transition-colors text-sm font-medium">
            Prefer traditional browsing? View all products →
          </Link>
        </div>
      </div>

      <button
        onClick={() => setShowBucketModal(true)}
        className="flex fixed right-6 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl shadow-lg transition-all duration-200 items-center justify-center z-30"
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
                      className={`flex flex-col items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${filters.colors.includes(color.value) ? "border-yellow-400 bg-yellow-50" : "border-gray-200"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color.value)}
                        onChange={() => handleFilterChange("colors", color.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-6 h-6 rounded-full border-2 ${color.value === "black"
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
