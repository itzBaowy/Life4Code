import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BadRequestException } from "../common/helpers/exception.helper.js";

const REGION = process.env.AWS_REGION;
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});

const buildObjectUrl = (bucket, region, key) => {
    const encodedKey = key
        .split("/")
        .map((part) => encodeURIComponent(part))
        .join("/");

    if (region === "us-east-1") {
        return `https://${bucket}.s3.amazonaws.com/${encodedKey}`;
    }

    return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
};

const sanitizeFileName = (fileName) => {
    return String(fileName || "")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

export const awsService = {
    async generateUploadUrl(fileName, fileType) {
        if (!fileName) {
            throw new BadRequestException("fileName is required");
        }

        if (!fileType) {
            throw new BadRequestException("fileType is required");
        }

        if (!String(fileType).startsWith("video/")) {
            throw new BadRequestException("Only video files are allowed");
        }

        if (!REGION || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
            throw new BadRequestException("AWS S3 environment variables are missing");
        }

        const safeFileName = sanitizeFileName(fileName);
        if (!safeFileName) {
            throw new BadRequestException("Invalid fileName");
        }

        const key = `videos/${Date.now()}-${safeFileName}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 15 * 60,
        });

        const fileUrl = buildObjectUrl(BUCKET_NAME, REGION, key);

        return {
            uploadUrl,
            fileUrl,
            key,
            expiresIn: 15 * 60,
        };
    },
};
