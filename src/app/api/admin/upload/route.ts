import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPEG, PNG and WebP are supported" },
                { status: 400 }
            );
        }

        // Create unique filename
        const fileExtension = file.name.split(".").pop() || "jpg";
        const fileName = `${uuidv4()}.${fileExtension}`;

        // Define upload directory and ensure it exists
        const uploadDir = path.join(process.cwd(), "public/uploads/posters");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            console.error("Error creating directory:", error);
        }

        // Define full file path
        const filePath = path.join(uploadDir, fileName);

        // Convert file to buffer and write to filesystem
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        // Return the public URL to the file
        const publicUrl = `/uploads/posters/${fileName}`;

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Error uploading file" },
            { status: 500 }
        );
    }
}