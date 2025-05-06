import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { Result, Err, Ok, Option, None } from 'ts-results-es';
import { Preferences } from './preferences';
import { createPantry, Pantry } from './pantry';
import { Cookbook, createCookbook } from './cookbook';

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
    email: string;
    passwordHash: string;
    preferences: Option<Preferences>;
    pantry: Pantry
    cookbook: Cookbook
};

export const validateUser = (
    name: string,
    email: string,
    password: string
): Result<void, string[]> => {
    const errors: string[] = [];

    if (!name) {
        errors.push('Name is required.');
    }

    if (!email) {
        errors.push('Email is required.');
    }

    // Email validation using a simple regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        errors.push('Email is not valid.');
    }

    if (!password) {
        errors.push('Password hash is required.');
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

export const createUser = (
    name: string,
    email: string,
    password: string,
    preferences: Option<Preferences> = None,
): Result<User, string[]> => {
    return validateUser(name, email, password).map(() => {
        const passwordHash = hashPassword(password);
        return { name, email, passwordHash, preferences, pantry: createPantry(), cookbook: createCookbook(email) };
    });
};

// TODO: Add better hashing and salting for passwords with an external library
const hashPassword = (password: string): string => {
    // In a real application, use bcrypt or similar
    return `hashed_${password}`;
};
