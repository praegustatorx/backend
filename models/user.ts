import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { Result, Err, Ok } from 'ts-results-es';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

//hash the password before saving it
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = model("userModel", userSchema);

export default User;

// TODO: Add abstractions for fields if needed
type User = {
    name: string;
    username: string;
    passwordHash: string;
};

export const validateUser = (
    name: string,
    username: string,
    password: string
): Result<void, string[]> => {
    const errors: string[] = [];

    if (!name) {
        errors.push('Name is required.');
    }

    if (!username) {
        errors.push('Username is required.');
    }

    if (!password) {
        errors.push('Password hash is required.');
    }

    if (username.length < 3) {
        errors.push('Username must be at least 3 characters long.');
    }

    if (password.length < 60) {
        errors.push(
            'Password hash is too short. It should be a secure hash (at least 60 characters).'
        );
    }

    if (errors.length > 0) {
        return Err(errors);
    }

    return Ok(undefined);
};

const createUser = (
    name: string,
    username: string,
    password: string
): Result<User, string[]> => {
    return validateUser(name, username, password).map(() => {
        let passwordHash = hashPassword(password);
        return { name, username, passwordHash};
    });
};

// TODO: Add better hashing and salting for passwords with an external library
const hashPassword = (password: string): string => {
    // In a real application, use bcrypt or similar
    return `hashed_${password}`;
};
