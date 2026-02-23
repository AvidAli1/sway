"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Eye, MoreHorizontal, X, MessageSquare } from "lucide-react"

export default function AdminComplaints() {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState("All")
    const [userType, setUserType] = useState("All")
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Update Status Form
    const [statusUpdate, setStatusUpdate] = useState("")
    const [adminNotes, setAdminNotes] = useState("")

    useEffect(() => {
        fetchComplaints()
    }, [filterStatus, userType])

    const fetchComplaints = async () => {
        setLoading(true)
        try {
            let url = `/api/admin/complaints?status=${filterStatus}&userType=${userType}`

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

    const openComplaintModal = (complaint) => {
        setSelectedComplaint(complaint)
        setStatusUpdate(complaint.status)
        setAdminNotes(complaint.adminNotes || "")
        setIsModalOpen(true)
    }

    const handleUpdateStatus = async () => {
        if (!selectedComplaint) return

        try {
            const res = await fetch(`/api/admin/complaints/${selectedComplaint._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    status: statusUpdate,
                    adminNotes: adminNotes
                })
            })

            const data = await res.json()
            if (data.success) {
                // Update local list
                setComplaints(complaints.map(c =>
                    c._id === selectedComplaint._id ? data.complaint : c
                ))
                setIsModalOpen(false)
            } else {
                alert("Failed to update status")
            }
        } catch (error) {
            console.error("Error updating status:", error)
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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Complaints Management</h2>

                <div className="flex gap-4 items-center">
                    {/* User Type Toggle */}
                    <div className="bg-gray-200 p-1 rounded-lg flex gap-1">
                        <button
                            onClick={() => setUserType("All")}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${userType === "All" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setUserType("Customers")}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${userType === "Customers" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                        >
                            Customers
                        </button>
                        <button
                            onClick={() => setUserType("Brands")}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${userType === "Brands" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                        >
                            Brands
                        </button>
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    >
                        <option value="All">All Status</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Loading complaints...</td>
                            </tr>
                        ) : complaints.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No complaints found.</td>
                            </tr>
                        ) : (
                            complaints.map((complaint) => (
                                <tr key={complaint._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{complaint.user?.name || "Unknown"}</div>
                                        <div className="text-sm text-gray-500">{complaint.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{complaint.type}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{complaint.subject}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openComplaintModal(complaint)}
                                            className="text-yellow-600 hover:text-yellow-900"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedComplaint && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-900">Complaint Details</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">From</p>
                                    <p className="font-medium text-gray-900">{selectedComplaint.user?.name}</p>
                                    <p className="text-sm text-gray-600">{selectedComplaint.user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Date</p>
                                    <p className="font-medium text-gray-900">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Type</p>
                                    <p className="font-medium text-gray-900">{selectedComplaint.type}</p>
                                </div>
                                {selectedComplaint.order && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Order Ref</p>
                                        <p className="font-medium text-gray-900">{selectedComplaint.order.orderNumber}</p>
                                    </div>
                                )}
                            </div>

                            {/* Subject & Description */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Subject: {selectedComplaint.subject}</h4>
                                <div className="bg-white border border-gray-200 rounded p-4 text-gray-700">
                                    {selectedComplaint.description}
                                </div>
                            </div>

                            {/* Admin Actions */}
                            <div className="border-t pt-6">
                                <h4 className="font-medium text-gray-900 mb-4">Resolution & Status</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={statusUpdate}
                                            onChange={(e) => setStatusUpdate(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-400"
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (Visible to User)</label>
                                    <textarea
                                        rows={3}
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-400"
                                        placeholder="Add response or notes..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
