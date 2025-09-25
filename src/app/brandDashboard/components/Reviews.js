"use client"

import { useState } from "react"
import { Star, ThumbsUp, MessageCircle, Filter } from "lucide-react"

export default function Reviews() {
  const [ratingFilter, setRatingFilter] = useState("all")

  // Mock reviews data
  const [reviews] = useState([
    {
      id: 1,
      customer: {
        name: "Emma Brown",
        avatar: "/brand_dashboard/emma_brown.jpg",
      },
      product: {
        name: "Summer Dress",
        image: "/products_page/summer_floral_dress.jpg",
      },
      rating: 5,
      review:
        "Absolutely love this dress! The fabric is so soft and comfortable. Perfect fit and the color is exactly as shown in the pictures. Will definitely order more from this brand!",
      date: "2024-01-13T16:45:00Z",
      verified: true,
      helpful: 12,
      orderId: "SW1006",
    },
    {
      id: 2,
      customer: {
        name: "Hassan Khan",
        avatar: "/brand_dashboard/hassan_khan.jpg",
      },
      product: {
        name: "Designer Jeans",
        image: "/landing_page_products/designer_jeans.jpg",
      },
      rating: 4,
      review:
        "Good quality jeans with a nice fit. The material feels durable and the stitching is well done. Only minor issue is that they're a bit tight around the waist initially, but they stretch out after wearing.",
      date: "2024-01-12T11:30:00Z",
      verified: true,
      helpful: 8,
      orderId: "SW1007",
    },
    {
      id: 3,
      customer: {
        name: "Aisha Ahmed",
        avatar: "/brand_dashboard/aisha_ahmed.jpg",
      },
      product: {
        name: "Premium Cotton Hoodie",
        image: "/products_page/premium_hoodie.jpg",
      },
      rating: 5,
      review:
        "This hoodie exceeded my expectations! Super cozy and warm, perfect for winter. The yellow color is vibrant and hasn't faded after multiple washes. Highly recommend!",
      date: "2024-01-10T09:15:00Z",
      verified: true,
      helpful: 15,
      orderId: "SW1008",
    },
    {
      id: 4,
      customer: {
        name: "Omar Sheikh",
        avatar: "/brand_dashboard/omar_sheikh.jpg",
      },
      product: {
        name: "Casual T-Shirt",
        image: "/products_page/oversized_tshirt.jpg",
      },
      rating: 3,
      review:
        "The t-shirt is okay, nothing special. The fabric is decent but I expected better quality for the price. It's comfortable to wear but the print started fading after a few washes.",
      date: "2024-01-08T14:20:00Z",
      verified: true,
      helpful: 3,
      orderId: "SW1009",
    },
    {
      id: 5,
      customer: {
        name: "Zara Khan",
        avatar: "/brand_dashboard/zara_khan.jpg",
      },
      product: {
        name: "Vintage Denim Jacket",
        image: "/products_page/vintage_denim_jacket.jpg",
      },
      rating: 5,
      review:
        "Love this jacket! The vintage look is perfect and it goes with everything. Great quality denim and the fit is exactly what I wanted. Fast shipping too!",
      date: "2024-01-05T18:30:00Z",
      verified: true,
      helpful: 20,
      orderId: "SW1010",
    },
  ])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
      </div>
    )
  }

  const filteredReviews = reviews.filter((review) => {
    if (ratingFilter === "all") return true
    return review.rating === Number.parseInt(ratingFilter)
  })

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage: (reviews.filter((review) => review.rating === rating).length / reviews.length) * 100,
  }))

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
            <p className="text-gray-600">See what customers are saying about your products</p>
          </div>

          {/* Rating Overview */}
          <div className="bg-gray-50 rounded-lg p-4 lg:w-80">
            <div className="flex items-center gap-4 mb-3">
              <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
              <div>
                {renderStars(Math.round(averageRating))}
                <p className="text-sm text-gray-600 mt-1">{reviews.length} total reviews</p>
              </div>
            </div>

            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="w-8 text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 mt-6">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-200">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex gap-4">
                <img
                  src={review.customer.avatar || "/placeholder.svg"}
                  alt={review.customer.name}
                  className="w-10 h-10 rounded-full bg-gray-200"
                />

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{review.customer.name}</h4>
                        {review.verified && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">• {formatDate(review.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={review.product.image || "/placeholder.svg"}
                      alt={review.product.name}
                      className="w-12 h-12 rounded-lg bg-gray-100 object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{review.product.name}</p>
                      <p className="text-sm text-gray-500">Order #{review.orderId}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{review.review}</p>

                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">Helpful ({review.helpful})</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">
              {ratingFilter !== "all" ? `No ${ratingFilter}-star reviews yet` : "Customer reviews will appear here"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
