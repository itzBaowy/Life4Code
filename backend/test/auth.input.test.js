import { describe, it, expect } from 'vitest';
import { validateUsername, validatePassword, validateEmail } from '../src/common/helpers/validate.helper.js';

// Mock BadRequestException để test
class BadRequestException extends Error { }

// Unit test cho validateUsername

describe('validateUsername', () => {
    it('should pass with valid username', () => {
        expect(() => validateUsername('valid_user123')).not.toThrow();
    });
    it('should throw if username contains special chars', () => {
        expect(() => validateUsername('invalid$user!')).toThrow();
    });
    it('should throw if username is longer than 30 chars', () => {
        expect(() => validateUsername('a'.repeat(31))).toThrow();
    });
    it('should throw if username is empty', () => {
        expect(() => validateUsername('')).toThrow();
    });
    it('should throw if username is null', () => {
        expect(() => validateUsername(null)).toThrow();
    });
    it('should throw if username is undefined', () => {
        expect(() => validateUsername(undefined)).toThrow();
    });
    it('should throw if username is only special chars', () => {
        expect(() => validateUsername('!@#$%^&*')).toThrow();
    });
    it('should pass with only numbers', () => {
        expect(() => validateUsername('123456')).not.toThrow();
    });
    it('should pass with only letters', () => {
        expect(() => validateUsername('abcdef')).not.toThrow();
    });
    it('should throw if username contains space', () => {
        expect(() => validateUsername('user name')).toThrow();
    });
});

describe('validatePassword', () => {
    it('should pass with valid password', () => {
        expect(() => validatePassword('Valid1234')).not.toThrow();
    });
    it('should throw if password is too short', () => {
        expect(() => validatePassword('Abc123')).toThrow();
    });
    it('should throw if missing uppercase', () => {
        expect(() => validatePassword('valid1234')).toThrow();
    });
    it('should throw if missing lowercase', () => {
        expect(() => validatePassword('VALID1234')).toThrow();
    });
    it('should throw if missing number', () => {
        expect(() => validatePassword('ValidPass')).toThrow();
    });
    it('should throw if password is empty', () => {
        expect(() => validatePassword('')).toThrow();
    });
    it('should throw if password is null', () => {
        expect(() => validatePassword(null)).toThrow();
    });
    it('should throw if password is undefined', () => {
        expect(() => validatePassword(undefined)).toThrow();
    });
});

describe('validateEmail', () => {
    it('should pass with valid email', () => {
        expect(() => validateEmail('test@example.com')).not.toThrow();
    });
    it('should throw if email is empty', () => {
        expect(() => validateEmail('')).toThrow();
    });
    it('should throw if email is invalid', () => {
        expect(() => validateEmail('invalid-email')).toThrow();
    });
    it('should throw if email is null', () => {
        expect(() => validateEmail(null)).toThrow();
    });
    it('should throw if email is undefined', () => {
        expect(() => validateEmail(undefined)).toThrow();
    });
    it('should throw if email missing @', () => {
        expect(() => validateEmail('testexample.com')).toThrow();
    });
    it('should throw if email missing domain', () => {
        expect(() => validateEmail('test@')).toThrow();
    });
});
