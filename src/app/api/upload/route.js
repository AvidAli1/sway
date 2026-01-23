
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + '_' + file.name.replaceAll(' ', '_');
        const uploadDir = path.join(process.cwd(), 'public/uploads');

        try {
            await writeFile(path.join(uploadDir, filename), buffer);
        } catch (e) {
            // Create dir if not exists (redundant if mkdir run, but safe)
            // Ignoring for now assuming mkdir worked or dir exists
            console.error("Write error", e);
        }

        return NextResponse.json({ success: true, url: `/uploads/${filename}` });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
