import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

fal.config({ credentials: process.env.FAL_KEY });

export async function POST(request) {
    try {
        const formData = await request.formData();
        const humanImage = formData.get('human_image');
        const garmentImage = formData.get('garment_image');

        if (!humanImage || !garmentImage) {
            return NextResponse.json(
                { status: 'error', message: 'Both human_image and garment_image are required' },
                { status: 400 }
            );
        }

        // Upload both images to fal.ai storage in parallel
        const [personImageUrl, clothingImageUrl] = await Promise.all([
            fal.storage.upload(humanImage),
            fal.storage.upload(garmentImage),
        ]);

        // Call the virtual try-on model
        const result = await fal.subscribe('fal-ai/image-apps-v2/virtual-try-on', {
            input: {
                person_image_url: personImageUrl,
                clothing_image_url: clothingImageUrl,
            },
        });

        console.log('fal.ai result:', JSON.stringify(result, null, 2));

        const data = result.data || result;
        const outputImage = data?.image?.url || data?.images?.[0]?.url || data?.output?.url || data?.url;
        if (!outputImage) {
            return NextResponse.json(
                { status: 'error', message: 'No image returned from model', debug: data },
                { status: 500 }
            );
        }

        return NextResponse.json({ status: 'success', result_url: outputImage });
    } catch (error) {
        console.error('VTON generation error:', error);
        return NextResponse.json(
            { status: 'error', message: error.message || 'Failed to generate virtual try-on' },
            { status: 500 }
        );
    }
}
