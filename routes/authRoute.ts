import express, { Request, Response } from "express";
import User, { toLoginDto } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pantryDAO from "../dao/pantry.dao";
import cookbookDao from "../dao/cookbook.dao";
import preferencesDAO from "../dao/preferences.dao"; // Add this import
import mongoose, { Types } from "mongoose";

const router = express.Router();

router.get("/test", (req: Request, res: Response): void => {
  console.log("Hello World");
  res.status(200).json({
    message: "Server is running and the test endpoint is working!",
  });
});

router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userExists = await User.findOne({ email }).session(session);
    if (userExists) {
      await session.abortTransaction();
      session.endSession();
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const preferencesResult = await preferencesDAO.createPreferences(email, session);
    if (preferencesResult.isErr()) {
      console.warn("Error creating preferences:", preferencesResult.error);
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ message: "Error creating preferences: " + preferencesResult.error.message });
      return;
    }

    const pantryResult = await pantryDAO.createPantry(email, session);
    if (pantryResult.isErr()) {
      console.warn("Error creating pantry:", pantryResult.error);
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({
        message: "Error creating pantry",
      });
      return;
    }

    const cookbookResult = await cookbookDao.createCookbook(email, session);
    if (cookbookResult.isErr()) {
      console.warn("Error creating cookbook:", cookbookResult.error);
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({
        message: "Error creating cookbook",
      });
      return;
    }

    await User.create([{ name, email, password}], { session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.warn("Registration transaction error:", error);
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({
      message: "Error registering user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid credentials");
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const loginUser = toLoginDto(user);
    res.status(200).json({ token, loginUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
