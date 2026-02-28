"use client"
import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cartCount, setCartCount] = useState(0)
    const [cartProductIds, setCartProductIds] = useState(new Set())

    const updateCartCount = async () => {
        try {
            // Check if running in client
            if (typeof window === "undefined") return

            const token = localStorage.getItem("authToken")
            if (!token) {
                try {
                    const localCart = localStorage.getItem("cart")
                    if (localCart) {
                        const parsed = JSON.parse(localCart)
                        const items = Array.isArray(parsed) ? parsed : []
                        const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0)
                        setCartCount(count)

                        const ids = new Set(items.map(item => item.id || item.product))
                        setCartProductIds(ids)
                    } else {
                        setCartCount(0)
                        setCartProductIds(new Set())
                    }
                } catch (e) {
                    setCartCount(0)
                    setCartProductIds(new Set())
                }
                return
            }

            const res = await fetch("/api/customer/cart", {
                headers: { "Authorization": `Bearer ${token}` },
                cache: "no-store"
            })
            const data = await res.json()
            if (res.ok && data.success && data.cart) {
                // Count total quantity of items
                const count = data.cart.items.reduce((acc, item) => acc + item.quantity, 0)
                setCartCount(count)

                // Track product IDs in cart
                const ids = new Set(data.cart.items.map(item => {
                    return typeof item.product === 'object' ? item.product._id : item.product
                }))
                setCartProductIds(ids)
            } else {
                // If error (e.g. 401), maybe clear count
                if (res.status === 401) {
                    setCartCount(0)
                    setCartProductIds(new Set())
                }
            }
        } catch (e) {
            console.error("Failed to update cart count", e)
        }
    }

    useEffect(() => {
        updateCartCount()

        // Allow other components to trigger update via event if context isn't accessible or for legacy support
        const handleCartUpdate = () => updateCartCount()
        window.addEventListener("cart-updated", handleCartUpdate)

        // Also listen for storage changes (e.g. login/logout in other tabs)
        const handleStorage = () => updateCartCount()
        window.addEventListener("storage", handleStorage)

        return () => {
            window.removeEventListener("cart-updated", handleCartUpdate)
            window.removeEventListener("storage", handleStorage)
        }
    }, [])

    return (
        <CartContext.Provider value={{ cartCount, updateCartCount, cartProductIds }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
