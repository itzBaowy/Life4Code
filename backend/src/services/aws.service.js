import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
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

const extractKeyFromS3Url = (videoUrl, bucketName) => {
    const rawValue = String(videoUrl || "").trim();
    if (!rawValue) {
        throw new BadRequestException("videoUrl is required");
    }

    // Allow passing key directly (e.g. videos/abc.mp4)
    if (!rawValue.startsWith("http://") && !rawValue.startsWith("https://")) {
        return decodeURIComponent(rawValue.replace(/^\/+/, ""));
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(rawValue);
    } catch {
        throw new BadRequestException("Invalid videoUrl format");
    }

    const host = parsedUrl.hostname;
    const pathname = decodeURIComponent(parsedUrl.pathname || "");
    let key = pathname.replace(/^\/+/, "");

    // Path-style URL: s3.<region>.amazonaws.com/<bucket>/<key>
    if (key.startsWith(`${bucketName}/`)) {
        key = key.slice(bucketName.length + 1);
    }

    // Virtual-hosted-style URL: <bucket>.s3.<region>.amazonaws.com/<key>
    const isBucketHost = host === `${bucketName}.s3.amazonaws.com` || host.startsWith(`${bucketName}.s3.`);

    if (!isBucketHost && !pathname.includes(`/${bucketName}/`)) {
        throw new BadRequestException("videoUrl does not belong to configured S3 bucket");
    }

    if (!key) {
        throw new BadRequestException("Cannot extract S3 object key from videoUrl");
    }

    return key;
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

    async generateDownloadUrl(videoUrl) {
        if (!REGION || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
            throw new BadRequestException("AWS S3 environment variables are missing");
        }

        const key = extractKeyFromS3Url(videoUrl, BUCKET_NAME);

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        const downloadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 7200,
        });

        return {
            downloadUrl,
            key,
            expiresIn: 7200,
        };
    },
};
