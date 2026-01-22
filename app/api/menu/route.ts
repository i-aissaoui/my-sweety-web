import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'menu-data.json');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
    try {
        if (!fs.existsSync(DATA_PATH)) {
            return NextResponse.json({ menu: [] }, { headers: corsHeaders });
        }
        const data = fs.readFileSync(DATA_PATH, 'utf8');
        return NextResponse.json(JSON.parse(data), { headers: corsHeaders });
    } catch (error) {
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
        console.log('--- SYNC RECEIVED ---');
        console.log('Menu items:', body.menu?.length);
        if (body.menu && body.menu.length > 0) {
            console.log('First item has imageUrl:', !!body.menu[0].imageUrl);
            if (body.menu[0].imageUrl) {
                console.log('ImageUrl start:', body.menu[0].imageUrl.substring(0, 50));
            }
        }

        fs.writeFileSync(DATA_PATH, JSON.stringify(body, null, 2));
        return NextResponse.json({ message: 'Menu updated successfully' }, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update menu' }, { status: 500, headers: corsHeaders });
    }
}
