import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

const DATA_PATH = path.join(process.cwd(), 'menu-data.json');
const KV_KEY = 'my_sweety_menu_data';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const isKVReady = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
const isVercel = process.env.VERCEL === '1';

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
    try {
        if (isVercel) {
            if (!isKVReady) {
                console.error('CRITICAL: Vercel KV is NOT connected. Please connect KV in the Vercel Storage tab.');
                return NextResponse.json({
                    error: 'Database not connected',
                    details: 'Vercel KV environment variables are missing. Go to Vercel Dashboard -> Storage -> Connect KV.'
                }, { status: 500, headers: corsHeaders });
            }
            const data = await kv.get(KV_KEY);
            return NextResponse.json(data || { menu: [] }, { headers: corsHeaders });
        }

        // Local Fallback
        if (!fs.existsSync(DATA_PATH)) {
            return NextResponse.json({ menu: [] }, { headers: corsHeaders });
        }
        const data = fs.readFileSync(DATA_PATH, 'utf8');
        return NextResponse.json(JSON.parse(data), { headers: corsHeaders });
    } catch (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Failed to read menu data' }, { status: 500, headers: corsHeaders });
    }
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const STATIC_SYNC_KEY = 'mysweety_secure_2024';

        if (!authHeader || authHeader !== `Bearer ${STATIC_SYNC_KEY}`) {
            return NextResponse.json({ error: 'Unauthorized: Invalid Connection Key' }, { status: 401, headers: corsHeaders });
        }

        const body = await request.json();

        if (isVercel) {
            if (!isKVReady) {
                return NextResponse.json({
                    error: 'Database not connected',
                    details: 'Vercel KV environment variables are missing. Go to Vercel Dashboard -> Storage -> Connect KV.'
                }, { status: 500, headers: corsHeaders });
            }
            await kv.set(KV_KEY, body);
            console.log('--- SYNC SAVED TO KV ---');
            return NextResponse.json({ message: 'Menu updated successfully (KV)' }, { headers: corsHeaders });
        }

        // Local Fallback
        fs.writeFileSync(DATA_PATH, JSON.stringify(body, null, 2));
        console.log('--- SYNC SAVED TO FILE ---');
        return NextResponse.json({ message: 'Menu updated successfully (File)' }, { headers: corsHeaders });
    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: 'Failed to update menu' }, { status: 500, headers: corsHeaders });
    }
}
