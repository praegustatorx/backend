import { isEmpty } from '../models/pantry';
import { validateUser } from '../models/user';

describe('User Model', () => {
    describe('validateUser function', () => {
        const NAME = 'John Doe';
        const USERNAME = 'johndoe';
        const PASSWORD_HASH = 'aSecurePasswordHash1234567890123456789012345678901234567890123456789';

        test('should return Ok when provided valid inputs', () => {
            const name = NAME;
            const username = USERNAME;
            const passwordHash = PASSWORD_HASH;

            const result = validateUser(name, username, passwordHash);

            expect(result.isOk()).toBe(true);
        });

        test('should return error when name is missing', () => {
            const name = '';
            const username = USERNAME;
            const passwordHash = PASSWORD_HASH;

            const result = validateUser(name, username, passwordHash);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toContain('Name is required.');
        });

        test('should return error when username is missing', () => {
            const name = NAME;
            const username = '';
            const passwordHash = PASSWORD_HASH;

            const result = validateUser(name, username, passwordHash);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toContain('Username is required.');
        });

        test('should return error when passwordHash is missing', () => {
            const name = NAME;
            const username = USERNAME;
            const passwordHash = '';

            const result = validateUser(name, username, passwordHash);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toContain('Password hash is required.');
        });

        test('should return error when username is too short', () => {
            const name = NAME;
            const username = 'jo';
            const passwordHash = PASSWORD_HASH;

            const result = validateUser(name, username, passwordHash);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toContain('Username must be at least 3 characters long.');
        });

        test('should return error when passwordHash is too short', () => {
            const name = NAME;
            const username = USERNAME;
            const passwordHash = 'short';

            const result = validateUser(name, username, passwordHash);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toContain(
                'Password hash is too short. It should be a secure hash (at least 60 characters).'
            );
        });

        test('should return multiple errors when multiple fields are invalid', () => {
            const name = '';
            const username = '';
            const passwordHash = '';

            const result = validateUser(name, username, passwordHash);

            expect(result.isErr()).toBe(true);
            console.log(result.unwrapErr());
            const errors = result.unwrapErr();
            expect(errors).toContain('Name is required.');
            expect(errors).toContain('Username is required.');
            expect(errors).toContain('Password hash is required.');
        });
    });

    describe('createUser function', () => {
        test('should create user with empty pantry when given valid arguments', () => {
            // Need to export createUser for this test
            const { createUser } = require('../models/user');

            const name = 'John Doe';
            const username = 'johndoe';
            const password = 'aSecurePasswordHash1234567890123456789012345678901234567890123456789';

            const result = createUser(name, username, password);

            expect(result.isOk()).toBe(true);
            const user = result.unwrap();
            expect(user.pantry).toBeDefined();
            expect(isEmpty(user.pantry)).toBe(true);
        });
    });
});