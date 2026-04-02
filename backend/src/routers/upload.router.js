import express from "express";
import { uploadController } from "../controllers/upload.controller.js";
import { protect } from "../common/middlewares/protect.middleware.js";

const uploadRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: API upload video with AWS S3 Presigned URL
 */

/**
 * @swagger
 * /api/upload/video-presigned-url:
 *   get:
 *     summary: Generate presigned URL for uploading lesson video to S3
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: Original file name (e.g. lesson-1.mp4)
 *       - in: query
 *         name: fileType
 *         required: true
 *         schema:
 *           type: string
 *         description: MIME type of the file (e.g. video/mp4)
 *     responses:
 *       200:
 *         description: Generate presigned URL successfully
 *       400:
 *         description: Invalid query params or missing AWS config
 */
uploadRouter.get("/video-presigned-url", protect, uploadController.getVideoPresignedUrl);

export default uploadRouter;
