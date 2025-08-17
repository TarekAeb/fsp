import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("fileName");

    if (!fileName) {
        return NextResponse.json({ message: "Missing fileName parameter" }, { status: 400 });
    }

    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL valid for 1 hour
        return NextResponse.json({ url });
    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
