import { responseSuccess } from "../common/helpers/function.helper.js";
import { awsService } from "../services/aws.service.js";

export const uploadController = {
    async getVideoPresignedUrl(req, res, next) {
        const { fileName, fileType } = req.query;

        const result = await awsService.generateUploadUrl(fileName, fileType);
        const response = responseSuccess(result, "Generate video upload URL successfully");

        res.status(response.statusCode).json(response);
    },
};
