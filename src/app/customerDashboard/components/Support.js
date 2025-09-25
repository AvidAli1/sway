"use client"

import { useState } from "react"
import { MessageCircle, Phone, Mail, HelpCircle, FileText } from "lucide-react"

export default function Support() {
  const [activeTab, setActiveTab] = useState("faq")
  const [contactForm, setContactForm] = useState({
    subject: "",
    category: "",
    message: "",
    priority: "medium",
  })

  const faqs = [
    {
      id: 1,
      question: "How can I track my order?",
      answer:
        "You can track your order by going to 'My Orders' section in your dashboard and clicking on the 'Track Order' button. You'll also receive tracking information via SMS and email.",
    },
    {
      id: 2,
      question: "What is your return policy?",
      answer:
        "We offer a 7-day return policy for most items. Items must be in original condition with tags attached. You can initiate a return from your order history.",
    },
    {
      id: 3,
      question: "How long does delivery take?",
      answer:
        "Standard delivery takes 3-5 business days within major cities and 5-7 business days for other areas. Express delivery is available for faster shipping.",
    },
    {
      id: 4,
      question: "What payment methods do you accept?",
      answer:
        "We accept credit/debit cards (Visa, Mastercard), Easypaisa, JazzCash, and Cash on Delivery (COD) for your convenience.",
    },
    {
      id: 5,
      question: "How can I change or cancel my order?",
      answer:
        "You can modify or cancel your order within 1 hour of placing it. After that, please contact our support team for assistance.",
    },
    {
      id: 6,
      question: "Do you offer size exchanges?",
      answer:
        "Yes, we offer size exchanges within 7 days of delivery. The item must be unworn and in original condition with tags attached.",
    },
  ]

  const handleSubmitContact = (e) => {
    e.preventDefault()
    console.log("Contact form submitted:", contactForm)
    // In real app, this would send the message to support
    alert("Your message has been sent! We'll get back to you within 24 hours.")
    setContactForm({
      subject: "",
      category: "",
      message: "",
      priority: "medium",
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Help & Support</h2>
          <p className="text-gray-600">Get help with your orders, returns, and account</p>
        </div>
      </div>

      {/* Quick Contact Options */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-yellow-400 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Live Chat</h4>
            <p className="text-sm text-gray-600 mb-3">Chat with our support team</p>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">Start Chat</button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-yellow-400 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">Phone Support</h4>
            <p className="text-sm text-gray-600 mb-3">+92 300 SWAY (7929)</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Call Now</button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-yellow-400 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">WhatsApp</h4>
            <p className="text-sm text-gray-600 mb-3">Message us on WhatsApp</p>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">Send Message</button>
          </div>
        </div>
      </div>

      {/* Support Tabs */}
      <div className="p-6">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("faq")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "faq"
                ? "border-yellow-400 text-yellow-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <HelpCircle className="w-4 h-4 inline mr-2" />
            FAQ
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "contact"
                ? "border-yellow-400 text-yellow-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Contact Form
          </button>
          <button
            onClick={() => setActiveTab("guides")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "guides"
                ? "border-yellow-400 text-yellow-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Guides
          </button>
        </div>

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
            {faqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg">
                <details className="group">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                    <h4 className="font-medium text-gray-900">{faq.question}</h4>
                    <HelpCircle className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        {/* Contact Form Tab */}
        {activeTab === "contact" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send us a Message</h3>
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={contactForm.category}
                    onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="order">Order Issues</option>
                    <option value="return">Returns & Refunds</option>
                    <option value="payment">Payment Issues</option>
                    <option value="account">Account Issues</option>
                    <option value="technical">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={contactForm.priority}
                  onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Please provide as much detail as possible about your issue..."
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
              >
                Send Message
              </button>
            </form>
          </div>
        )}

        {/* Guides Tab */}
        {activeTab === "guides" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Help Guides</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">How to Place an Order</h4>
                </div>
                <p className="text-sm text-gray-600">Step-by-step guide to placing your first order</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Size Guide</h4>
                </div>
                <p className="text-sm text-gray-600">Find your perfect fit with our sizing charts</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Return Process</h4>
                </div>
                <p className="text-sm text-gray-600">Learn how to return or exchange items</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-yellow-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Account Management</h4>
                </div>
                <p className="text-sm text-gray-600">Manage your profile, addresses, and preferences</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
