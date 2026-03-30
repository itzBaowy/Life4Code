import prisma from '../prisma/connect.prisma.js';
import bcrypt from 'bcryptjs';
import { tokenService } from './token.service.js';
import { BadRequestException, UnauthorizedException } from "../common/helpers/exception.helper.js";
import { validateUsername, validatePassword, validateEmail } from '../common/helpers/validate.helper.js';

export const authService = {
    async register(req) {
        const { username, email, password } = req.body;
        // Validate username
        validateUsername(username);
        // Validate email
        validateEmail(email);
        // Validate password
        validatePassword(password);
        //check duplicate username
        const existUsername = await prisma.users.findUnique({ where: { username } });
        if (existUsername) throw new BadRequestException('Username đã tồn tại');
        // check duplicate email
        const existEmail = await prisma.users.findUnique({ where: { email } });
        if (existEmail) throw new BadRequestException('Email đã tồn tại');

        // Hash Password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Lấy roleId mặc định cho user
        const userRole = await prisma.role.findFirst({ where: { name: 'User' } });
        if (!userRole) throw new BadRequestException('Role User chưa được khởi tạo');

        // Create User
        return await prisma.users.create({
            data: {
                email,
                password: hashedPassword,
                username,
                roleId: userRole.id,
            },
            include: { role: true }
        });
    },

    async login(req) {
        const { username, password } = req.body;

        const userExits = await prisma.users.findUnique({
            where: {
                username: username,
            },
        });

        if (!userExits) {
            throw new BadRequestException("Sai tên đăng nhập hoặc mật khẩu");
        }

        // kiểm tra password
        const isPassword = bcrypt.compareSync(password, userExits.password);
        if (!isPassword) {
            throw new BadRequestException("Sai tên đăng nhập hoặc mật khẩu")
        }

        const tokens = tokenService.createTokens(userExits.id);

        return tokens;
    },
};