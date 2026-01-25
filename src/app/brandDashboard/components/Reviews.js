"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, MessageCircle, Filter, Send, X, Loader2 } from "lucide-react"

export default function Reviews() {
  const [ratingFilter, setRatingFilter] = useState("all")
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState(null) // ID of review being replied to
  const [replyText, setReplyText] = useState("")
  const [submittingReply, setSubmittingReply] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return
      const res = await fetch("/api/brand/reviews", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setReviews(data.reviews)
      }
    } catch (e) {
      console.error("Failed to fetch reviews", e)
    } finally {
      setLoading(false)
    }
  }

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return
    setSubmittingReply(true)
    try {
      const token = localStorage.getItem("authToken")
      const res = await fetch("/api/brand/reviews", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reviewId, replyText })
      })
      const data = await res.json()
      if (data.success) {
        // Update local state
        setReviews(prev => prev.map(r =>
          r._id === reviewId ? { ...r, reply: data.review.reply } : r
        ))
        setReplyingTo(null)
        setReplyText("")
      }
    } catch (e) {
      console.error("Reply failed", e)
    } finally {
      setSubmittingReply(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      const token = localStorage.getItem("authToken")
      const res = await fetch(`/api/brand/reviews?reviewId=${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setReviews(prev => prev.map(r =>
          r._id === deleteId ? { ...r, reply: undefined } : r
        ))
        setDeleteId(null)
      }
    } catch (e) {
      console.error("Delete failed", e)
    }
  }

  const handleEditReply = (review) => {
    setReplyingTo(review._id)
    setReplyText(review.reply?.text || "")
  }

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

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter((review) => review.rating === rating).length / reviews.length) * 100 : 0,
  }))

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-yellow-400" /></div>
  }

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
            <div key={review._id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex gap-4">
                <img
                  src={
                    review.user?.avatar ||
                    (review.user?.gender === 'female'
                      ? "https://avatar.iran.liara.run/public/girl"
                      : "https://avatar.iran.liara.run/public/boy")
                  }
                  onError={(e) => {
                    e.target.onerror = null;
                    const name = review.user?.name || review.userName || "User";
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
                  }}
                  alt={review.user?.name || review.userName || "User"}
                  className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                />

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{review.user?.name || review.userName || "Customer"}</h4>
                        {review.isVerifiedPurchase && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">• {formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={review.product?.thumbnail?.SD || review.product?.images?.[0]?.SD || "/placeholder.svg"}
                      alt={review.product?.name}
                      className="w-12 h-12 rounded-lg bg-gray-100 object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{review.product?.name}</p>
                      {review.order && <p className="text-sm text-gray-500">Order #{typeof review.order === 'string' ? review.order.substring(0, 8) : review.order?._id?.substring(0, 8)}</p>}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                  {/* Brand Reply Display */}
                  {review.reply && review.reply.text && replyingTo !== review._id && (
                    <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-100 relative group">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">Response from Brand • {formatDate(review.reply.createdAt)}</p>
                      <p className="text-sm text-gray-800">{review.reply.text}</p>
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditReply(review)} className="p-1 hover:bg-yellow-100 rounded text-yellow-700">
                          <span className="text-xs font-medium">Edit</span>
                        </button>
                        <button onClick={() => setDeleteId(review._id)} className="p-1 hover:bg-red-100 rounded text-red-600">
                          <span className="text-xs font-medium">Delete</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">Helpful ({review.likes})</span>
                    </button>
                    {!review.reply && (
                      <button
                        onClick={() => {
                          setReplyingTo(replyingTo === review._id ? null : review._id)
                          setReplyText("")
                        }}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">Reply</span>
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === review._id && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a response to this review..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none min-h-[100px] text-sm"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyText("")
                          }}
                          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReplySubmit(review._id)}
                          disabled={submittingReply || !replyText.trim()}
                          className="px-3 py-1.5 text-sm bg-yellow-400 text-black hover:bg-yellow-500 rounded-md font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          {submittingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          {review.reply ? "Update Reply" : "Send Reply"}
                        </button>
                      </div>
                    </div>
                  )}

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

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 scale-100 transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Response?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this response? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
