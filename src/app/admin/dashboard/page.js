'use client'

import { useState, useEffect } from 'react'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        brands: 0,
        users: 0,
        orders: 0
    })

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Placeholder Stats */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Brands</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
                    <p className="text-green-600 text-sm mt-2 flex items-center">
                        <span className="bg-green-100 px-2 py-0.5 rounded text-xs font-medium">Active</span>
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
                    <p className="text-blue-600 text-sm mt-2 flex items-center">
                        <span className="bg-blue-100 px-2 py-0.5 rounded text-xs font-medium">Registered</span>
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Orders</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">--</p>
                    <p className="text-purple-600 text-sm mt-2 flex items-center">
                        <span className="bg-purple-100 px-2 py-0.5 rounded text-xs font-medium">All Time</span>
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900">Welcome to the Admin Panel</h3>
                <p className="text-gray-500 mt-2">Select an option from the sidebar to manage the platform.</p>
            </div>
        </div>
    )
}
