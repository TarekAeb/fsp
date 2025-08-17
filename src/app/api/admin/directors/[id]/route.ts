import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { deleteDirector } from '@/server/service/admin';
import { uploadImage } from '@/lib/uploadImage';
import { db } from '@/server/database';
import { revalidatePath } from 'next/cache';
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
      try {
        const formData = await request.formData();
        const directorId = Number(id);
        const name = formData.get('name') as string;
        const nationality = formData.get('nationality') as string;
        const birthDate = formData.get('birthDate') as string;
        const photo = formData.get('photo') as File | null;

        // Get current director to check if we need to update the photo
        const currentDirector = await db
            .selectFrom('Director')
            .select(['photoUrl'])
            .where('id', '=', directorId)
            .executeTakeFirst();

        let photoUrl = currentDirector?.photoUrl || null;

        // Upload new photo if provided
        if (photo) {
            photoUrl = await uploadImage(photo, 'directors');
        }

        // Update director in database
        await db
            .updateTable('Director')
            .set({
                name,
                nationality,
                dateBirth: new Date(birthDate),
                photoUrl: photoUrl ?? undefined
            })
            .where('id', '=', directorId)
            .execute();

        revalidatePath('/admin/directors');

        return NextResponse.json({
            message: 'Director updated successfully'
        });

    } catch (error) {
        console.error('Error updating director:', error);
        return NextResponse.json({ error: 'Failed to update director' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const urlParts = request.url.split('/');
        const directorId = urlParts[urlParts.length - 1];

        if (!directorId) {
            return NextResponse.json({ error: 'director ID is required' }, { status: 400 });
        }

        await deleteDirector(parseInt(directorId));
        return NextResponse.json({ message: 'director deleted successfully' }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}