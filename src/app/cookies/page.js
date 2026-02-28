"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CookiePolicy() {
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
                    <div className="space-y-6 text-gray-700 leading-relaxed">
                        <p className="text-sm font-medium text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. What Are Cookies</h2>
                            <p>
                                As is common practice with almost all professional websites, SWAY uses cookies, which are tiny files that are
                                downloaded to your computer, to improve your experience. This page describes what information they gather,
                                how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these
                                cookies from being stored however this may downgrade or 'break' certain elements of the sites functionality.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Cookies</h2>
                            <p>
                                We use cookies for a variety of reasons detailed below. Unfortunately, in most cases there are no industry
                                standard options for disabling cookies without completely disabling the functionality and features they add
                                to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or
                                not in case they are used to provide a service that you use.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. The Cookies We Set</h2>
                            <ul className="list-disc pl-6 space-y-3">
                                <li>
                                    <strong>Account related cookies:</strong> If you create an account with us then we will use cookies for the
                                    management of the signup process and general administration. These cookies will usually be deleted when you
                                    log out however in some cases they may remain afterwards to remember your site preferences when logged out.
                                </li>
                                <li>
                                    <strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact.
                                    This prevents you from having to log in every single time you visit a new page. These cookies are typically
                                    removed or cleared when you log out to ensure that you can only access restricted features and areas when logged in.
                                </li>
                                <li>
                                    <strong>E-commerce and cart related cookies:</strong> This site offers e-commerce or payment facilities and some
                                    cookies are essential to ensure that your shopping cart items or orders are remembered between pages so that we
                                    can process it properly.
                                </li>
                                <li>
                                    <strong>Site preferences cookies:</strong> In order to provide you with a great experience on this site we provide
                                    the functionality to set your preferences for how this site runs when you use it. In order to remember your
                                    preferences we need to set cookies so that this information can be called whenever you interact with a page.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third Party Cookies</h2>
                            <p>
                                In some special cases we also use cookies provided by trusted third parties. The following section details which
                                third party cookies you might encounter through this site.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>
                                    This site uses Google Analytics which is one of the most widespread and trusted analytics solutions on the web
                                    for helping us to understand how you use the site and ways that we can improve your experience.
                                </li>
                                <li>
                                    Third party analytics are used to track and measure usage of this site so that we can continue to produce engaging
                                    content.
                                </li>
                                <li>
                                    We also use social media buttons and/or plugins on this site that allow you to connect with your social network
                                    in various ways. For these to work, social media sites will set cookies through our site.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Disabling Cookies</h2>
                            <p>
                                You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how
                                to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that
                                you visit. Disabling cookies will usually result in also disabling certain functionality and features of this
                                site. Therefore it is recommended that you do not disable cookies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. More Information</h2>
                            <p>
                                Hopefully that has clarified things for you. If there is something that you aren't sure whether you need or not,
                                it's usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
                                For more information, feel free to contact us at support@sway.com.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
