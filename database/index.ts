import mongoose from "mongoose";

const mongoString = process.env.DATABASE_URL as string;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoString);
        console.log("Database connected");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
}

export default connectDB;

