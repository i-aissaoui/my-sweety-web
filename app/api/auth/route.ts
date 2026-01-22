import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        // For this simple implementation, we'll use a hardcoded password.
        // In a real production app, this should be an environment variable.
        const APP_PASSWORD = process.env.APP_PASSWORD || 'sweety2026';

        if (password === APP_PASSWORD) {
            return NextResponse.json({ success: true, message: 'Authenticated' });
        } else {
            return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Error processing request' }, { status: 500 });
    }
}
