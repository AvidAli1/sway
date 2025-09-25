"use client"

import { useState } from "react"
import { CreditCard, Plus, Edit, Trash2, Shield } from "lucide-react"

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "card",
      cardNumber: "**** **** **** 1234",
      cardType: "Visa",
      expiryDate: "12/26",
      holderName: "John Doe",
      isDefault: true,
    },
    {
      id: 2,
      type: "card",
      cardNumber: "**** **** **** 5678",
      cardType: "Mastercard",
      expiryDate: "08/25",
      holderName: "John Doe",
      isDefault: false,
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMethod, setEditingMethod] = useState(null)
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    holderName: "",
    isDefault: false,
  })

  const handleAddPaymentMethod = () => {
    const newMethod = {
      id: Date.now(),
      type: "card",
      cardNumber: `**** **** **** ${formData.cardNumber.slice(-4)}`,
      cardType: getCardType(formData.cardNumber),
      expiryDate: formData.expiryDate,
      holderName: formData.holderName,
      isDefault: formData.isDefault,
    }
    setPaymentMethods([...paymentMethods, newMethod])
    setShowAddForm(false)
    resetForm()
  }

  const handleEditPaymentMethod = (method) => {
    setEditingMethod(method.id)
    setFormData({
      cardNumber: "",
      expiryDate: method.expiryDate,
      cvv: "",
      holderName: method.holderName,
      isDefault: method.isDefault,
    })
    setShowAddForm(true)
  }

  const handleUpdatePaymentMethod = () => {
    setPaymentMethods(
      paymentMethods.map((method) =>
        method.id === editingMethod
          ? {
              ...method,
              expiryDate: formData.expiryDate,
              holderName: formData.holderName,
              isDefault: formData.isDefault,
            }
          : method,
      ),
    )
    setShowAddForm(false)
    setEditingMethod(null)
    resetForm()
  }

  const handleDeletePaymentMethod = (methodId) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== methodId))
  }

  const handleSetDefault = (methodId) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === methodId,
      })),
    )
  }

  const resetForm = () => {
    setFormData({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      holderName: "",
      isDefault: false,
    })
  }

  const getCardType = (cardNumber) => {
    const firstDigit = cardNumber.charAt(0)
    if (firstDigit === "4") return "Visa"
    if (firstDigit === "5") return "Mastercard"
    return "Card"
  }

  const getCardIcon = (cardType) => {
    switch (cardType) {
      case "Visa":
        return (
          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
            V
          </div>
        )
      case "Mastercard":
        return (
          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
            MC
          </div>
        )
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
            <p className="text-gray-600">Manage your saved payment methods</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-6 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-medium text-blue-900">Your payment information is secure</h3>
            <p className="text-sm text-blue-700">We use industry-standard encryption to protect your card details.</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Payment Method Form */}
      {showAddForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingMethod ? "Edit Payment Method" : "Add New Card"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Holder Name</label>
              <input
                type="text"
                value={formData.holderName}
                onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            {!editingMethod && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\s/g, "") })}
                  placeholder="1234 5678 9012 3456"
                  maxLength="16"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input
                type="text"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                placeholder="MM/YY"
                maxLength="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            {!editingMethod && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                <input
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                  placeholder="123"
                  maxLength="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Set as default payment method
            </label>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={editingMethod ? handleUpdatePaymentMethod : handleAddPaymentMethod}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {editingMethod ? "Update Card" : "Add Card"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setEditingMethod(null)
                resetForm()
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment Methods List */}
      <div className="p-6">
        {paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`border rounded-lg p-4 ${
                  method.isDefault ? "border-yellow-400 bg-yellow-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getCardIcon(method.cardType)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{method.cardType}</h3>
                        {method.isDefault && (
                          <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{method.cardNumber}</p>
                      <p className="text-sm text-gray-500">
                        Expires {method.expiryDate} • {method.holderName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEditPaymentMethod(method)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment methods saved</h3>
            <p className="text-gray-600 mb-6">Add your payment methods for faster checkout</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Card
            </button>
          </div>
        )}
      </div>

      {/* Alternative Payment Methods */}
      <div className="p-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Payment Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">EP</span>
            </div>
            <h4 className="font-medium text-gray-900">Easypaisa</h4>
            <p className="text-sm text-gray-600">Mobile wallet payment</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-orange-600 font-bold">JC</span>
            </div>
            <h4 className="font-medium text-gray-900">JazzCash</h4>
            <p className="text-sm text-gray-600">Mobile wallet payment</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">COD</span>
            </div>
            <h4 className="font-medium text-gray-900">Cash on Delivery</h4>
            <p className="text-sm text-gray-600">Pay when you receive</p>
          </div>
        </div>
      </div>
    </div>
  )
}
