import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/database';
import { revalidatePath } from 'next/cache';
import { uploadImage } from '@/lib/uploadImage'; // Create this utility

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const nationality = formData.get('nationality') as string;
        const birthDate = formData.get('birthDate') as string;
        const bio = formData.get('bio') as string;
        const photo = formData.get('photo') as File | null;

        let photoUrl = null;

        // Upload photo if provided
        if (photo) {
            photoUrl = await uploadImage(photo, 'actors');
        }

        // Insert actor into database
        const result = await db
            .insertInto('Actor')
            .values({
                name,
                nationality,
                dateBirth: new Date(birthDate),
                bio,
                photoUrl
            })
            .returning('id')
            .executeTakeFirst();

        revalidatePath('/admin/actors');

        return NextResponse.json({
            message: 'Actor created successfully',
            id: result?.id
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating actor:', error);
        return NextResponse.json({ error: 'Failed to create actor' }, { status: 500 });
    }
}
