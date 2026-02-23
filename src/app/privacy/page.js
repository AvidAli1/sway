"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                                <span className="hidden sm:block font-medium">Back to Home</span>
                            </Link>
                            <img src="/logo2.png" alt="SWAY Logo" className="h-7 w-auto mt-2" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                    <div className="space-y-6 text-gray-700 leading-relaxed">
                        <p className="text-sm font-medium text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
                            <p>
                                We collect information you provide directly to us, such as when you create or modify your account,
                                request on-demand services, contact customer support, or otherwise communicate with us. This information
                                may include: name, email, phone number, postal address, profile picture, payment method, and other
                                information you choose to provide.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Information</h2>
                            <p className="mb-2">We may use the information we collect about you to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide, maintain, and improve our services and products;</li>
                                <li>Process transactions and send you related information;</li>
                                <li>Send you technical notices, updates, security alerts and administrative messages;</li>
                                <li>Respond to your comments, questions and requests and provide customer service;</li>
                                <li>Communicate with you about products, services, offers, and events offered by SWAY;</li>
                                <li>Personalize and improve the Services, and provide content or features that match user profiles or interests.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Sharing of Information</h2>
                            <p>
                                We may share the information we collect about you as described in this Statement or as described at the
                                time of collection, including as follows:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>With third party vendors, consultants and other service providers who need access to such information to carry out work on our behalf;</li>
                                <li>In response to a request for information by a competent authority if we believe disclosure is in accordance with, or is otherwise required by, any applicable law, regulation, or legal process;</li>
                                <li>With law enforcement officials, government authorities, or other third parties if we believe your actions are inconsistent with our user agreements, Terms of Service, or policies, or to protect the rights, property, or safety of SWAY or others.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Security</h2>
                            <p>
                                SWAY takes reasonable measures to help protect information about you from loss, theft, misuse and unauthorized
                                access, disclosure, alteration and destruction. We use industry-standard encryption protocols and secure server infrastructures.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Retention</h2>
                            <p>
                                We store the information we collect about you for as long as is necessary for the purpose(s) for which we
                                collected it, and in accordance with applicable laws. You may request deletion of your data at any time through your account settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Choices</h2>
                            <p>
                                You can review and edit certain account information by logging in to your account settings and profile.
                                If you wish to delete your account or pause data collection, you can contact our support team.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at privacy@sway.com or through our
                                customer support channels.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
