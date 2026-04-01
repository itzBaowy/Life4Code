import prisma from "../prisma/connect.prisma.js";
import {
    BadRequestException,
    NotFoundException,
} from "../common/helpers/exception.helper.js";

const isObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || ""));

export const roleService = {
    async getAllRoles() {
        return prisma.role.findMany({
            orderBy: { name: "asc" },
        });
    },

    async getRoleById(req) {
        const { roleId } = req.params;

        if (!isObjectId(roleId)) {
            throw new BadRequestException("roleId không hợp lệ");
        }

        const role = await prisma.role.findUnique({
            where: { id: roleId },
        });

        if (!role) {
            throw new NotFoundException("Không tìm thấy role");
        }

        return role;
    },

    async createRole(req) {
        const { name, description, permission } = req.body;

        if (!name || !String(name).trim()) {
            throw new BadRequestException("name không được để trống");
        }

        const existed = await prisma.role.findUnique({
            where: { name: String(name).trim() },
        });

        if (existed) {
            throw new BadRequestException("name role đã tồn tại");
        }

        return prisma.role.create({
            data: {
                name: String(name).trim(),
                description: description ? String(description).trim() : null,
                permission: Array.isArray(permission) ? permission : [],
            },
        });
    },

    async updateRole(req) {
        const { roleId } = req.params;
        const { name, description, permission } = req.body;

        if (!isObjectId(roleId)) {
            throw new BadRequestException("roleId không hợp lệ");
        }

        const existing = await prisma.role.findUnique({ where: { id: roleId } });
        if (!existing) {
            throw new NotFoundException("Không tìm thấy role");
        }

        const data = {};

        if (name !== undefined) {
            const nextName = String(name).trim();
            if (!nextName) {
                throw new BadRequestException("name không được để trống");
            }

            const duplicated = await prisma.role.findFirst({
                where: {
                    name: nextName,
                    NOT: { id: roleId },
                },
            });

            if (duplicated) {
                throw new BadRequestException("name role đã tồn tại");
            }

            data.name = nextName;
        }

        if (description !== undefined) {
            data.description = description ? String(description).trim() : null;
        }

        if (permission !== undefined) {
            data.permission = Array.isArray(permission) ? permission : [];
        }

        return prisma.role.update({
            where: { id: roleId },
            data,
        });
    },

    async deleteRole(req) {
        const { roleId } = req.params;

        if (!isObjectId(roleId)) {
            throw new BadRequestException("roleId không hợp lệ");
        }

        const existing = await prisma.role.findUnique({ where: { id: roleId } });
        if (!existing) {
            throw new NotFoundException("Không tìm thấy role");
        }

        await prisma.role.delete({ where: { id: roleId } });
        return { roleId };
    },
};
