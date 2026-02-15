"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Plus, X, Search, Filter } from "lucide-react"

export default function MyComplaints() {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // New Complaint Form State
    const [formData, setFormData] = useState({
        type: "Website",
        subject: "",
        description: "",
        order: "", // Optional order ID
        images: [] // Future implementation
    })

    // Complaint Types
    const complaintTypes = ["Website", "Order", "Other"]

    useEffect(() => {
        fetchComplaints()
    }, [])

    const fetchComplaints = async () => {
        try {
            let url = "/api/complaints"
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            })
            const data = await res.json()
            if (data.success) {
                setComplaints(data.complaints)
            }
        } catch (error) {
            console.error("Error fetching complaints:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await fetch("/api/complaints", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok && data.success) {
                // Refresh list
                fetchComplaints()
                setIsModalOpen(false)
                setFormData({ type: "Website", subject: "", description: "", order: "", images: [] })
            } else {
                alert(data.error || "Failed to submit complaint")
            }
        } catch (error) {
            console.error("Error submitting complaint:", error)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "Open": return "bg-blue-100 text-blue-800"
            case "In Progress": return "bg-yellow-100 text-yellow-800"
            case "Resolved": return "bg-green-100 text-green-800"
            case "Closed": return "bg-gray-100 text-gray-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Complaints</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 font-medium"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Complaint</span>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : complaints.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No complaints found</h3>
                    <p className="text-gray-500 mt-1">If you have any issues, feel free to raise a complaint.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {complaints.map((complaint) => (
                        <div key={complaint._id} className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                        <span className="text-sm text-gray-500">• {new Date(complaint.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mt-2">{complaint.subject}</h3>
                                </div>
                                {/* Could add a view details button here */}
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">{complaint.description}</p>
                            {complaint.adminNotes && (
                                <div className="mt-3 bg-gray-50 p-3 rounded text-sm text-gray-700">
                                    <span className="font-semibold block text-xs uppercase text-gray-500 mb-1">Response from Support:</span>
                                    {complaint.adminNotes}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* New Complaint Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-900">Submit New Complaint</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                >
                                    {complaintTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Conditional Order ID */}
                            {formData.type === "Order" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Order ID / Number (Required)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                        placeholder="Enter Order ID"
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    />
                                </div>
                            )}

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    placeholder="Brief summary of the issue"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    placeholder="Please describe your issue in detail..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500"
                                >
                                    Submit Complaint
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
