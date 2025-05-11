import { Schema, Types, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    preferences: { type: Types.ObjectId, ref: "preferences", required: true },
    cookbook: { type: Types.ObjectId, ref: "cookbook", required: true },
    pantry: { type: Types.ObjectId, ref: "pantry", required: true },
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
    preferences: Types.ObjectId;
    cookbook: Types.ObjectId;
    pantry: Types.ObjectId;
}

type LoginUserDto = {
    name: string;
    email: string;
    preferences: string;
    pantry: string; 
    cookbook: string; 
};

export const toLoginDto = (user: UserDocument): LoginUserDto => {
    return {
        name: user.name,
        email: user.email,
        preferences: user.preferences.toString(),
        pantry: user.pantry.toString(),
        cookbook: user.cookbook.toString(),
    };
}