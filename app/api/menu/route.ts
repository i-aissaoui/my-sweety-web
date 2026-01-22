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
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action'); // 'init' or 'append'

        if (isVercel) {
            if (!isKVReady) {
                return NextResponse.json({
                    error: 'Database not connected',
                    details: 'Vercel KV environment variables are missing.'
                }, { status: 500, headers: corsHeaders });
            }

            // SMART LOGIC: Auto-detect action if not specified
            // 1. Explicit 'init' OR empty menu -> CLEAR DB
            // 2. Explicit 'append' OR has items -> APPEND TO DB
            const isInit = action === 'init' || (body.menu && body.menu.length === 0);
            const isAppend = action === 'append' || (body.menu && body.menu.length > 0);

            if (isInit) {
                // Clear existing data or start fresh with empty menu
                await kv.set(KV_KEY, { ...body, menu: [] });
                console.log('--- SYNC INIT: DATABASE CLEARED ---');
                return NextResponse.json({ message: 'Sync initialized' }, { headers: corsHeaders });
            } else if (isAppend) {
                // Fetch existing data
                const existingData: any = await kv.get(KV_KEY) || { menu: [] };

                // Filter out duplicates based on ID before appending
                const newItems = body.menu || [];
                const existingItems = existingData.menu || [];
                const combined = [...existingItems];

                for (const item of newItems) {
                    // Remove old version if exists
                    const idx = combined.findIndex((p: any) => p.id === item.id);
                    if (idx !== -1) combined.splice(idx, 1);
                    combined.push(item);
                }

                // Update with combined menu
                await kv.set(KV_KEY, { ...body, menu: combined });
                console.log(`--- SYNC APPEND: Added ${newItems.length} items. Total: ${combined.length} ---`);
                return NextResponse.json({ message: 'Batch appended' }, { headers: corsHeaders });
            }
        }

        // Local Fallback (Mock implementation for simplicity)
        const isInit = action === 'init' || (body.menu && body.menu.length === 0);
        const isAppend = action === 'append' || (body.menu && body.menu.length > 0);

        if (isInit) {
            fs.writeFileSync(DATA_PATH, JSON.stringify({ ...body, menu: [] }, null, 2));
        } else if (isAppend) {
            const existing = JSON.parse(fs.existsSync(DATA_PATH) ? fs.readFileSync(DATA_PATH, 'utf8') : '{"menu":[]}');

            const newItems = body.menu || [];
            const existingItems = existing.menu || [];
            const combined = [...existingItems];

            for (const item of newItems) {
                const idx = combined.findIndex((p: any) => p.id === item.id);
                if (idx !== -1) combined.splice(idx, 1);
                combined.push(item);
            }

            fs.writeFileSync(DATA_PATH, JSON.stringify({ ...body, menu: combined }, null, 2));
        }

        return NextResponse.json({ message: 'Menu updated successfully (File)' }, { headers: corsHeaders });
    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: 'Failed to update menu' }, { status: 500, headers: corsHeaders });
    }
}
