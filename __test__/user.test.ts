import { isEmpty } from '../models/pantry';
import { validateUser, createUser } from '../models/user';

describe('User Model', () => {
    describe('validateUser function', () => {
        const NAME = 'John Doe';
        const EMAIL = 'john.doe@example.com';
        const PASSWORD_HASH = 'aSecurePasswordHash1234567890123456789012345678901234567890123456789';

        test('should return Ok when provided valid inputs', () => {
            const name = NAME;
            const email = EMAIL;
            const passwordHash = PASSWORD_HASH;

            const result = validateUser(name, email, passwordHash);

            expect(result.isOk()).toBe(true);
        });

        test('should return error when name is missing', () => {
            const name = '';
            const email = EMAIL;
            const passwordHash = PASSWORD_HASH;

            const result = validateUser(name, email, passwordHash);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toContain('Name is required.');
        });

        test('should return error when email is missing', () => {
            const name = NAME;
            const email = '';
            const passwordHash = PASSWORD_HASH;

            const result = validateUser(name, email, passwordHash);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toContain('Email is required.');
        });

        test('should return error when passwordHash is missing', () => {
            const name = NAME;
            const email = EMAIL;
            const passwordHash = '';

            const result = validateUser(name, email, passwordHash);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toContain('Password hash is required.');
        });

        test('should return error when email format is invalid', () => {
            const name = NAME;
            const email = 'invalid-email';
            const passwordHash = PASSWORD_HASH;

            const result = validateUser(name, email, passwordHash);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toContain('Email is not valid.');
        });

        test('should return error when passwordHash is too short', () => {
            const name = NAME;
            const email = EMAIL;
            const passwordHash = 'short';

            const result = validateUser(name, email, passwordHash);

            expect(result.isErr()).toBe(true);
            expect(result.unwrapErr()).toContain(
                'Password hash is too short. It should be a secure hash (at least 60 characters).'
            );
        });

        test('should return multiple errors when multiple fields are invalid', () => {
            const name = '';
            const email = '';
            const passwordHash = '';

            const result = validateUser(name, email, passwordHash);

            expect(result.isErr()).toBe(true);
            console.log(result.unwrapErr());
            const errors = result.unwrapErr();
            expect(errors).toContain('Name is required.');
            expect(errors).toContain('Email is required.');
            expect(errors).toContain('Password hash is required.');
        });
    });

    describe('createUser function', () => {
        test('should create user with empty pantry when given valid arguments', () => {
            const name = 'John Doe';
            const email = 'john.doe@example.com';
            const password = 'aSecurePasswordHash1234567890123456789012345678901234567890123456789';

            const result = createUser(name, email, password);

            expect(result.isOk()).toBe(true);
            const user = result.unwrap();
            expect(user.pantry).toBeDefined();
            expect(isEmpty(user.pantry)).toBe(true);
        });
    });
});