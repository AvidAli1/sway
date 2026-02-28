"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsOfService() {
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
                            <img src="/logo.png" alt="SWAY Logo" className="h-6 w-auto" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                    <div className="space-y-6 text-gray-700 leading-relaxed">
                        <p className="text-sm font-medium text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Agreement to Terms</h2>
                            <p>
                                By accessing or using the SWAY website and services, you agree to be bound by these Terms of Service and all
                                applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using
                                or accessing this site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. User Accounts</h2>
                            <p>
                                When you create an account with us, you must provide accurate, complete, and current information.
                                Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account
                                on our Service. You are responsible for safeguarding the password that you use to access the Service and for
                                any activities or actions under your password.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. E-commerce Purchases</h2>
                            <p className="mb-2">When you purchase products through SWAY:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.</li>
                                <li>We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order.</li>
                                <li>Prices for our products are subject to change without notice.</li>
                                <li>We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Intellectual Property</h2>
                            <p>
                                The Service and its original content (excluding products provided by our Partner Brands), features and
                                functionality are and will remain the exclusive property of SWAY and its licensors. The Service is protected
                                by copyright, trademark, and other laws of both the local region and foreign countries.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. User Guidelines</h2>
                            <p>
                                You may not use the Service for any illegal or unauthorized purpose nor may you, in the use of the Service,
                                violate any laws in your jurisdiction (including but not limited to copyright laws). You must not transmit
                                any worms or viruses or any code of a destructive nature.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Refunds and Returns Policy</h2>
                            <p>
                                We issue refunds and accept returns in accordance with our return guidelines available on the individual product
                                pages. Certain categories of products are exempt from being returned, such as perishable goods, custom products, and personal hygiene items.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
                            <p>
                                In no event shall SWAY, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable
                                for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of
                                profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability
                                to access or use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to Terms</h2>
                            <p>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes
                                a material change will be determined at our sole discretion. By continuing to access or use our Service after
                                those revisions become effective, you agree to be bound by the revised terms.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
