import prisma from "../prisma/connect.prisma.js";
import { buildQueryPrisma } from "../common/helpers/build_query_prisma.js";
import {
    BadRequestException,
    NotFoundException,
} from "../common/helpers/exception.helper.js";

const FOLDER_IMAGE = "public/images";
const isObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || ""));

export const userService = {
    async getAllUsers(req) {
        // console.log("service findAll", req.payload);
        const { page, pageSize, where, index } = buildQueryPrisma(req.query);

        // prisma
        const resultPrismaPromise = prisma.users.findMany({
            where: where,
            skip: index, // skip tới vị trí index nào (OFFSET)
            take: pageSize, // take lấy bao nhiêu phần tử (LIMIT)
            include: {
                role: true  // Include role data
            }
        });

        const totalItemPromise = prisma.users.count({
            where: where,
        });

        const [resultPrisma, totalItem] = await Promise.all([resultPrismaPromise, totalItemPromise]);

        // sequelize
        // const resultSequelize = await Article.findAll();

        return {
            page: page,
            pageSize: pageSize,
            totalItem: totalItem,
            totalPage: Math.ceil(totalItem / pageSize),
            items: resultPrisma,
        };
    },

    async getUserById(req) {
        const { userId } = req.params;

        if (!isObjectId(userId)) {
            throw new BadRequestException("userId không hợp lệ");
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: {
                role: true,
            },
        });

        if (!user) {
            throw new NotFoundException("Không tìm thấy user");
        }

        return user;
    },

    async updateUserRole(req) {
        const { userId } = req.params;
        const { roleId } = req.body;

        if (!isObjectId(userId)) {
            throw new BadRequestException("userId không hợp lệ");
        }

        if (!isObjectId(roleId)) {
            throw new BadRequestException("roleId không hợp lệ");
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new NotFoundException("Không tìm thấy user");
        }

        const role = await prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role) {
            throw new NotFoundException("Không tìm thấy role");
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: { roleId },
            include: {
                role: true,
            },
        });

        return updatedUser;
    },

    async deleteUser(req) {
        const { userId } = req.params;

        if (!isObjectId(userId)) {
            throw new BadRequestException("userId không hợp lệ");
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException("Không tìm thấy user");
        }

        await prisma.users.delete({
            where: { id: userId },
        });

        return { userId };
    },


    // async avatarCloud(req) {
    //     // NEXT_PUBLIC_BASE_DOMAIN_CLOUDINARY=https://res.cloudinary.com/***********/image/upload/

    //     // req.file is the `avatar` file
    //     // req.body will hold the text fields, if there were any
    //     if (!req.file) {
    //         throw new BadRequestException("Không có file");
    //     }

    //     const uploadResult = await new Promise((resolve, reject) => {
    //         cloudinary.uploader
    //             .upload_stream(
    //                 {
    //                     folder: FOLDER_IMAGE,
    //                 },
    //                 (error, uploadResult) => {
    //                     if (error) {
    //                         return reject(error);
    //                     }
    //                     return resolve(uploadResult);
    //                 }
    //             )
    //             .end(req.file.buffer);
    //     });

    //     // console.log(uploadResult);
    //     await prisma.user.update({
    //         where: {
    //             id: req.user.id,
    //         },
    //         data: {
    //             avatarCloudId: uploadResult.public_id,
    //         },
    //     });

    //     //   đảm bảo 1 user - 1 avatar
    //     if (req.user.avatarCloudId && req.user.avatarCloudId !== 'public/images/default_avatar') {
    //         console.log("deleted old avatar");
    //         cloudinary.uploader.destroy(req.user.avatarCloudId);
    //     }

    //     return true;
    // },

};

