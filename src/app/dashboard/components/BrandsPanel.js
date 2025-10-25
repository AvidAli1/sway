import React from "react"
import InviteBrand from "./InviteBrand"

export default function BrandsPanel() {
  return (
    <div className="space-y-6">
      <InviteBrand />

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Existing Brands</h3>
        <div className="space-y-3">
          {[
            { name: "Urban Style", status: "active" },
            { name: "Street Wear", status: "active" },
            { name: "Fashion Forward", status: "pending" },
          ].map((b, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-sm text-gray-600">Status: {b.status}</p>
              </div>
              <div>
                <button className="text-blue-600 hover:underline text-sm">View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
