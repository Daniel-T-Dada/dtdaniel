import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { idToken } = await request.json();

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
                client_secret: process.env.OAUTH_CLIENT_SECRET,
                code: idToken,
                redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/__/auth/handler`
            })
        });

        const data = await tokenResponse.json();

        if (!tokenResponse.ok) {
            return NextResponse.json(data, { status: tokenResponse.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Token exchange error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 