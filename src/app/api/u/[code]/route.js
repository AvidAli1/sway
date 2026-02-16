import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/dbConnect";
import Customer from "@/app/models/customerModel";
import ReferralLog from "@/app/models/referralLogModel";
import User from "@/app/models/userModel";

export async function GET(request, { params }) {
    try {
        await connectToDatabase();

        const { code } = await params;

        // 1. Validate Code
        const referrerCustomer = await Customer.findOne({ referralCode: code });
        if (!referrerCustomer) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // 2. Redirect with Cookie
        const redirectUrl = new URL('/', request.url);
        redirectUrl.searchParams.set('ref', code);

        const response = NextResponse.redirect(redirectUrl);

        // Set cookie valid for 7 days
        response.cookies.set('referral_code', code, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            httpOnly: true, // Secure cookie
            sameSite: 'lax'
        });

        return response;

    } catch (error) {
        console.error("Referral Error:", error);
        return NextResponse.redirect(new URL('/', request.url));
    }
}
