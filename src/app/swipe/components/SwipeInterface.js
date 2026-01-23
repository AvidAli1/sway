"use client"

import SwipeInterfaceMobile from "./SwipeInterfaceMobile"
import SwipeInterfaceDesktop from "./SwipeInterfaceDesktop"

export default function SwipeInterface(props) {
    return (
        <>
            {/* Mobile View */}
            <div className="md:hidden block h-full w-full">
                <SwipeInterfaceMobile {...props} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block h-full w-full">
                <SwipeInterfaceDesktop {...props} />
            </div>
        </>
    )
}
