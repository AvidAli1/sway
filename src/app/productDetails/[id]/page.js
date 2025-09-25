"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ProductDetailPage() {
  const params = useParams()
  const productId = Number.parseInt(params.id)

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [user, setUser] = useState(null)

  // All products data (same as in your products page)
  const allProducts = [
    {
      id: 1,
      title: "Premium Cotton Hoodie",
      brand: "Urban Style",
      price: 4500,
      originalPrice: 5500,
      images: [
        "/products_page/premium_hoodie.jpg",
        "/products_page/premium_hoodie_2.jpg",
        "/products_page/premium_hoodie_3.jpg",
        "/products_page/premium_hoodie_4.jpg",
      ],
      category: "tops",
      sizes: ["S", "M", "L", "XL"],
      colors: ["yellow", "black", "white"],
      rating: 4.8,
      reviews: 124,
      description:
        "Comfortable premium cotton hoodie perfect for casual wear. Made from 100% organic cotton with a soft fleece lining for ultimate comfort. Features a spacious kangaroo pocket and adjustable drawstring hood.",
      specifications: {
        Material: "100% Organic Cotton",
        Fit: "Regular Fit",
        Care: "Machine wash cold, tumble dry low",
        Origin: "Made in Pakistan",
        Weight: "450 GSM",
      },
      inStock: true,
      stockCount: 15,
      isSponsored: true,
      tags: ["trending", "new"],
    },
    {
      id: 2,
      title: "Vintage Denim Jacket",
      brand: "Street Wear",
      price: 6200,
      images: [
        "/products_page/vintage_denim_jacket.jpg",
        "/products_page/vintage_denim_jacket_2.jpg",
        "/products_page/vintage_denim_jacket_3.jpg",
      ],
      category: "jackets",
      sizes: ["M", "L", "XL"],
      colors: ["blue", "black"],
      rating: 4.6,
      reviews: 89,
      description:
        "Classic vintage-style denim jacket with modern fit. Features distressed detailing and classic button closure. Perfect for layering over any outfit.",
      specifications: {
        Material: "100% Cotton Denim",
        Fit: "Slim Fit",
        Care: "Machine wash cold, hang dry",
        Origin: "Made in Pakistan",
        Weight: "12 oz Denim",
      },
      inStock: true,
      stockCount: 8,
      isSponsored: true,
      tags: ["vintage", "classic"],
    },
    {
      id: 3,
      title: "Casual White Sneakers",
      brand: "Comfort Walk",
      price: 3800,
      images: [
        "/products_page/casual_white_sneakers.jpg",
        "/products_page/casual_white_sneakers_2.jpg",
        "/products_page/casual_white_sneakers_3.jpg",
      ],
      category: "shoes",
      sizes: ["7", "8", "9", "10", "11"],
      colors: ["white", "grey"],
      rating: 4.7,
      reviews: 156,
      description:
        "Comfortable everyday sneakers with premium cushioning. Features breathable mesh upper and durable rubber outsole.",
      specifications: {
        Material: "Synthetic Leather & Mesh",
        Sole: "Rubber Outsole",
        Care: "Wipe clean with damp cloth",
        Origin: "Made in Pakistan",
        Type: "Casual Sneakers",
      },
      inStock: true,
      stockCount: 22,
      tags: ["comfort", "casual"],
    },
    // Add more products with similar structure...
    {
      id: 4,
      title: "Oversized T-Shirt",
      brand: "Retro Vibes",
      price: 2200,
      images: ["/products_page/oversized_tshirt.jpg"],
      category: "tops",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["black", "white", "grey", "yellow"],
      rating: 4.5,
      reviews: 203,
      description: "Trendy oversized t-shirt with soft cotton blend. Perfect for a relaxed, casual look.",
      specifications: {
        Material: "60% Cotton, 40% Polyester",
        Fit: "Oversized",
        Care: "Machine wash cold",
        Origin: "Made in Pakistan",
        Weight: "180 GSM",
      },
      inStock: true,
      stockCount: 30,
      tags: ["oversized", "trendy"],
    },
    {
      id: 5,
      title: "Slim Fit Jeans",
      brand: "Elite Fashion",
      price: 5800,
      images: [
        "/products_page/slim_fit_jeans.jpg",
        "/products_page/slim_fit_jeans_2.jpg",
        "/products_page/slim_fit_jeans_3.jpg",
      ],
      category: "bottoms",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["blue", "black"],
      rating: 4.9,
      reviews: 78,
      description: "Premium slim fit jeans with stretch comfort. Made from high-quality denim with a modern cut.",
      specifications: {
        Material: "98% Cotton, 2% Elastane",
        Fit: "Slim Fit",
        Care: "Machine wash cold, hang dry",
        Origin: "Made in Pakistan",
        Weight: "12.5 oz Denim",
      },
      inStock: true,
      stockCount: 12,
      tags: ["premium", "slim-fit"],
    },
    {
      id: 6,
      title: "Summer Floral Dress",
      brand: "Chic Styles",
      price: 4200,
      images: ["/products_page/summer_floral_dress.jpg", "/products_page/summer_floral_dress_2.jpg"],
      category: "dresses",
      sizes: ["XS", "S", "M", "L"],
      colors: ["yellow", "white", "pink"],
      rating: 4.4,
      reviews: 92,
      description:
        "Beautiful floral print dress perfect for summer. Lightweight and breathable fabric with a flattering fit.",
      specifications: {
        Material: "100% Viscose",
        Fit: "Regular Fit",
        Care: "Hand wash cold",
        Origin: "Made in Pakistan",
        Length: "Midi Length",
      },
      inStock: true,
      stockCount: 18,
      tags: ["summer", "floral"],
    },
    {
      id: 7,
      title: "Leather Crossbody Bag",
      brand: "Luxury Goods",
      price: 7500,
      images: [
        "/products_page/leather_crossbody_bag.jpg",
        "/products_page/leather_crossbody_bag_2.jpg",
        "/products_page/leather_crossbody_bag_3.jpg",
      ],
      category: "accessories",
      sizes: ["One Size"],
      colors: ["brown", "black"],
      rating: 4.8,
      reviews: 45,
      description:
        "Premium leather crossbody bag with multiple compartments. Designed for everyday use with both style and practicality in mind.",
      specifications: {
        Material: "Genuine Cowhide Leather",
        Strap: "Adjustable Crossbody Strap",
        Care: "Clean with leather conditioner",
        Origin: "Made in Pakistan",
        Dimensions: "25cm x 18cm x 8cm",
      },
      inStock: false,
      stockCount: 0,
      tags: ["luxury", "leather"],
    },
    {
      id: 8,
      title: "Athletic Running Shoes",
      brand: "Sport Pro",
      price: 4900,
      images: [
        "/products_page/athletic_running_shoes.jpg",
        "/products_page/athletic_running_shoes_2.jpg",
        "/products_page/athletic_running_shoes_3.jpg",
      ],
      category: "shoes",
      sizes: ["7", "8", "9", "10", "11", "12"],
      colors: ["black", "white", "grey"],
      rating: 4.6,
      reviews: 134,
      description:
        "High-performance running shoes with advanced cushioning for long-distance comfort. Designed for both training and everyday wear.",
      specifications: {
        Material: "Mesh Upper with Synthetic Overlays",
        Sole: "EVA Midsole + Rubber Outsole",
        Care: "Wipe with damp cloth",
        Origin: "Made in Pakistan",
        Type: "Athletic Running Shoes",
      },
      inStock: true,
      stockCount: 20,
      tags: ["athletic", "performance"],
    },
    {
      id: 9,
      title: "Floral Button-Up Shirt",
      brand: "Tropical Wear",
      price: 3500,
      images: [
        "/virtual_tryon/buttonup_shirt.jpg"
      ],
      category: "tops",
      sizes: ["S", "M", "L", "XL"],
      colors: ["white", "multicolor"],
      rating: 4.6,
      reviews: 54,
      description: "Lightweight floral button-up shirt perfect for summer. Features a relaxed fit with breathable fabric and tropical-inspired print.",
      specifications: {
        Material: "100% Cotton",
        Fit: "Relaxed Fit",
        Care: "Machine wash cold, hang dry",
        Origin: "Made in Pakistan",
        Style: "Short-Sleeve Casual Shirt",
      },
      inStock: true,
      stockCount: 20,
      tags: ["summer", "casual", "floral"],
    },
    {
      id: 10,
      title: "Graphic Print Hoodie",
      brand: "Street Art",
      price: 3900,
      images: [
        "/products_page/graphic_print_hoodie.jpg",
        "/products_page/graphic_print_hoodie_2.jpg",
      ],
      category: "tops",
      sizes: ["M", "L", "XL"],
      colors: ["black", "white"],
      rating: 4.3,
      reviews: 88,
      description:
        "Unique graphic print hoodie with artistic design. Soft fabric and modern cut for a bold streetwear look.",
      specifications: {
        Material: "80% Cotton, 20% Polyester",
        Fit: "Regular Fit",
        Care: "Machine wash cold, tumble dry low",
        Origin: "Made in Pakistan",
        Print: "High-quality Screen Print",
      },
      inStock: true,
      stockCount: 14,
      tags: ["graphic", "artistic"],
    },
    {
      id: 11,
      title: "High-Waisted Jeans",
      brand: "Denim Co",
      price: 5200,
      images: [
        "/products_page/high_waisted_jeans.jpg",
        "/products_page/high_waisted_jeans_2.jpg",
      ],
      category: "bottoms",
      sizes: ["26", "28", "30", "32"],
      colors: ["blue", "black"],
      rating: 4.6,
      reviews: 112,
      description:
        "Flattering high-waisted jeans with vintage wash. Combines comfort with a timeless denim look.",
      specifications: {
        Material: "99% Cotton, 1% Elastane",
        Fit: "High-Waist Slim Fit",
        Care: "Machine wash cold, hang dry",
        Origin: "Made in Pakistan",
        Weight: "12 oz Denim",
      },
      inStock: true,
      stockCount: 16,
      tags: ["high-waist", "vintage"],
    },
    {
      id: 12,
      title: "Minimalist Watch",
      brand: "Time Piece",
      price: 6800,
      images: [
        "/products_page/minimalistic_watch.jpg",
        "/products_page/minimalistic_watch_2.jpg",
      ],
      category: "accessories",
      sizes: ["One Size"],
      colors: ["black", "white", "brown"],
      rating: 4.9,
      reviews: 234,
      description:
        "Elegant minimalist watch with a leather strap. Combines timeless design with modern craftsmanship.",
      specifications: {
        Material: "Stainless Steel Case & Genuine Leather Strap",
        Movement: "Quartz",
        Care: "Avoid contact with water and magnetic fields",
        Origin: "Made in Pakistan",
        Diameter: "40mm",
      },
      inStock: true,
      stockCount: 25,
      tags: ["minimalist", "elegant"],
    }
  ]

  // Find the current product
  const product = allProducts.find((p) => p.id === productId)

  // Related products (same category, different products)
  const relatedProducts = allProducts.filter((p) => p.category === product?.category && p.id !== productId).slice(0, 4)

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      name: "Ahmed Khan",
      rating: 5,
      date: "2024-01-15",
      comment: "Excellent quality! The fit is perfect and the material feels premium. Highly recommended!",
      verified: true,
    },
    {
      id: 2,
      name: "Sara Ali",
      rating: 4,
      date: "2024-01-10",
      comment: "Good product overall. The color is exactly as shown in the pictures. Fast delivery too.",
      verified: true,
    },
    {
      id: 3,
      name: "Hassan Sheikh",
      rating: 5,
      date: "2024-01-08",
      comment: "Amazing! This is my second purchase from this brand. Quality is consistent and great.",
      verified: false,
    },
  ]

  useEffect(() => {
    if (product && product.colors.length > 0) {
      setSelectedColor(product.colors[0])
    }
    if (product && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0])
    }
  }, [product])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link href="/products" className="text-yellow-600 hover:text-yellow-700">
            ← Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert("Please select size and color")
      return
    }

    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor,
      )

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }

      return [
        ...prev,
        {
          ...product,
          quantity,
          selectedSize,
          selectedColor,
        },
      ]
    })

    alert("Added to cart!")
  }

  const handleBuyNow = () => {
    handleAddToCart()
    // Redirect to checkout or cart page
    window.location.href = "/cart"
  }

  const handleVirtualTryOn = () => {
    // Navigate to virtual try-on page with product ID
    window.location.href = `/virtual_tryon/${product.id}`
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev === (product.images?.length || 1) - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? (product.images?.length || 1) - 1 : prev - 1))
  }

  const getColorClass = (color) => {
    const colorMap = {
      black: "bg-black",
      white: "bg-white border-2 border-gray-300",
      grey: "bg-gray-500",
      blue: "bg-blue-500",
      yellow: "bg-yellow-400",
      brown: "bg-amber-600",
      pink: "bg-pink-400",
    }
    return colorMap[color] || "bg-gray-400"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link
                href="/products"
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:block font-medium">Back</span>
              </Link>
              <img src="/logo2.png" alt="SWAY Logo" className="h-7 w-auto mt-2" />
            </div>

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
                <Link
                  href="/login"
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black">
            Products
          </Link>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-black font-medium">{product.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm">
              <img
                src={product.images?.[selectedImageIndex] || product.image}
                alt={product.title}
                className="w-full h-[500px] object-cover"
              />

              {/* Image Navigation */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Wishlist & Share */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isWishlisted ? "bg-red-500 text-white" : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white"
                    }`}
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImageIndex === index ? "border-yellow-400" : "border-gray-200"
                      }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Title */}
            <div>
              <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{product.rating}</span>
                </div>
                <span className="text-gray-600">({product.reviews} reviews)</span>
                {product.isSponsored && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                    Sponsored
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">PKR {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    PKR {product.originalPrice.toLocaleString()}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Color: {selectedColor}</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full border-2 transition-colors ${selectedColor === color ? "border-yellow-400 ring-2 ring-yellow-200" : "border-gray-300"
                      } ${getColorClass(color)}`}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Size: {selectedSize}</h3>
              <div className="flex gap-3 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg font-medium transition-colors ${selectedSize === size
                      ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockCount || 10, quantity + 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">{product.stockCount} items available</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="flex-1 bg-yellow-400 text-black py-3 px-6 rounded-lg font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Virtual Try-on Button */}
              <div className="flex justify-center pt-2">
                <button onClick={handleVirtualTryOn} class="pill-button">
                  <span class="label">Virtual Try-on</span>
                </button>
              </div>

              {!product.inStock && <p className="text-red-600 text-center font-medium">Out of Stock</p>}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-gray-600">On orders over PKR 2000</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-gray-600">100% secure checkout</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {["description", "specifications", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${activeTab === tab
                    ? "border-yellow-400 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  {tab}
                  {tab === "reviews" && ` (${product.reviews})`}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Premium quality materials</li>
                    <li>Comfortable fit for all-day wear</li>
                    <li>Durable construction</li>
                    <li>Easy care instructions</li>
                  </ul>
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Tags:</h4>
                    <div className="flex gap-2 flex-wrap">
                      {product.tags.map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-gray-200">
                    <span className="font-medium text-gray-900">{key}:</span>
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8">
                {/* Reviews Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">{product.rating}</div>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{product.reviews} reviews</p>
                    </div>

                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3 mb-2">
                          <span className="text-sm w-3">{rating}</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{review.name}</h4>
                            {review.verified && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative">
                    <img
                      src={relatedProduct.images || "/placeholder.svg"}
                      alt={relatedProduct.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {relatedProduct.isSponsored && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold">
                        Sponsored
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{relatedProduct.rating}</span>
                      <span className="text-sm text-gray-400">({relatedProduct.reviews})</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{relatedProduct.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{relatedProduct.brand}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">PKR {relatedProduct.price.toLocaleString()}</span>
                      {relatedProduct.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          PKR {relatedProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
