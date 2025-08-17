import { writeFile ,mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads an image to the server and returns the URL
 * @param file The file to upload
 * @param folder The folder to upload to (e.g., 'actors', 'movies')
 * @returns The URL of the uploaded image
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
    // Create a unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get file extension
    const originalName = file.name;
    const extension = path.extname(originalName);

    // Create a unique filename
    const filename = `${uuidv4()}${extension}`;

    // Create folder path
    const relativePath = `/uploads/${folder}`;
    const absolutePath = path.join(process.cwd(), 'public', relativePath);

    // Ensure directory exists
    await createDirIfNotExists(absolutePath);

    // Write file to disk
    const filePath = path.join(absolutePath, filename);
    await writeFile(filePath, buffer);

    // Return the public URL
    return `${relativePath}/${filename}`;
}

async function createDirIfNotExists(dirPath: string) {
    try {
        await mkdir(dirPath, { recursive: true });
    } catch (error) {
        console.error('Error creating directory:', error);
    }
}