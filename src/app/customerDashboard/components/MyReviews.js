"use client"

import { useState } from "react"
import { Star, Edit, Trash2 } from "lucide-react"

export default function MyReviews() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      productName: "Premium Cotton Hoodie",
      productImage: "/products_page/premium_hoodie.jpg",
      orderId: "SW2001",
      rating: 5,
      review:
        "Absolutely love this hoodie! The fabric is so soft and comfortable. Perfect fit and the color is exactly as shown in the pictures. Will definitely order more from this brand!",
      date: "2024-01-18T16:45:00Z",
      helpful: 12,
      brand: "Urban Style",
    },
    {
      id: 2,
      productName: "Designer Jeans",
      productImage: "/landing_page_products/designer_jeans.jpg",
      orderId: "SW2002",
      rating: 4,
      review:
        "Good quality jeans with a nice fit. The material feels durable and the stitching is well done. Only minor issue is that they're a bit tight around the waist initially, but they stretch out after wearing.",
      date: "2024-01-15T11:30:00Z",
      helpful: 8,
      brand: "Denim Co",
    },
    {
      id: 3,
      productName: "Graphic Print Hoodie",
      productImage: "/products_page/graphic_print_hoodie.jpg",
      orderId: "SW2004",
      rating: 5,
      review:
        "Love this jacket! The vintage look is perfect and it goes with everything. Great quality denim and the fit is exactly what I wanted. Fast shipping too!",
      date: "2024-01-10T18:30:00Z",
      helpful: 20,
      brand: "Retro Wear",
    },
  ])

  const [editingReview, setEditingReview] = useState(null)
  const [editFormData, setEditFormData] = useState({
    rating: 5,
    review: "",
  })

  const handleEditReview = (review) => {
    setEditingReview(review.id)
    setEditFormData({
      rating: review.rating,
      review: review.review,
    })
  }

  const handleUpdateReview = () => {
    setReviews(
      reviews.map((review) =>
        review.id === editingReview ? { ...review, ...editFormData, date: new Date().toISOString() } : review,
      ),
    )
    setEditingReview(null)
    setEditFormData({ rating: 5, review: "" })
  }

  const handleDeleteReview = (reviewId) => {
    setReviews(reviews.filter((review) => review.id !== reviewId))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
          />
        ))}
      </div>
    )
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">My Reviews</h2>
            <p className="text-gray-600">Reviews you've written for products</p>
          </div>

          {/* Review Stats */}
          <div className="bg-gray-50 rounded-lg p-4 lg:w-80">
            <div className="flex items-center gap-4 mb-3">
              <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
              <div>
                {renderStars(Math.round(averageRating))}
                <p className="text-sm text-gray-600 mt-1">Your average rating</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Total Reviews</span>
              <span className="font-medium">{reviews.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-200">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
              {editingReview === review.id ? (
                // Edit Form
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.productImage || "/placeholder.svg"}
                      alt={review.productName}
                      className="w-16 h-16 rounded-lg bg-gray-100 object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{review.productName}</h3>
                      <p className="text-sm text-gray-500">
                        {review.brand} • Order #{review.orderId}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    {renderStars(editFormData.rating, true, (rating) => setEditFormData({ ...editFormData, rating }))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                    <textarea
                      value={editFormData.review}
                      onChange={(e) => setEditFormData({ ...editFormData, review: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Share your experience with this product..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateReview}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Update Review
                    </button>
                    <button
                      onClick={() => {
                        setEditingReview(null)
                        setEditFormData({ rating: 5, review: "" })
                      }}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Review Display
                <div className="flex gap-4">
                  <img
                    src={review.productImage || "/placeholder.svg"}
                    alt={review.productName}
                    className="w-16 h-16 rounded-lg bg-gray-100 object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{review.productName}</h3>
                        <p className="text-sm text-gray-500">
                          {review.brand} • Order #{review.orderId}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">• {formatDate(review.date)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 leading-relaxed">{review.review}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{review.helpful} people found this helpful</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-6">Start shopping and share your experience with other customers</p>
            <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium">
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
