import { describe, it, expect } from 'vitest';
import { tokenService } from '../src/services/token.service.js';

// Mock env for secrets
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.RESET_TOKEN_SECRET = 'test-reset-secret';

describe('tokenService', () => {
    it('should create and verify access token', () => {
        const { accessToken } = tokenService.createTokens('user123');
        const decoded = tokenService.verifyAccessToken(accessToken);
        expect(decoded.userId).toBe('user123');
    });

    it('should create and verify refresh token', () => {
        const { refreshToken } = tokenService.createTokens('user456');
        const decoded = tokenService.verifyRefreshToken(refreshToken);
        expect(decoded.userId).toBe('user456');
    });

    it('should create and verify reset token', () => {
        const resetToken = tokenService.createResetToken('user789', 'test@email.com');
        const decoded = tokenService.verifyResetToken(resetToken);
        expect(decoded.userId).toBe('user789');
        expect(decoded.email).toBe('test@email.com');
    });

    it('should throw error for invalid access token', () => {
        expect(() => tokenService.verifyAccessToken('invalid.token')).toThrow();
    });

    it('should throw error for invalid refresh token', () => {
        expect(() => tokenService.verifyRefreshToken('invalid.token')).toThrow();
    });

    it('should throw error for invalid reset token', () => {
        expect(() => tokenService.verifyResetToken('invalid.token')).toThrow();
    });
});
