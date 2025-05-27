import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

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

const User = model<UserDocument>("userModel", userSchema);

export default User;

interface UserDocument extends Document {
    name: string;
    email: string;
    password: string;
}

type LoginUserDto = {
    name: string;
    email: string;
};

export const toLoginDto = (user: UserDocument): LoginUserDto => {
    return {
        name: user.name,
        email: user.email,
    };
}