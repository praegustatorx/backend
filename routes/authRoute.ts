import express, { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/test", (req: Request, res: Response): void => {
  console.log("Hello World");
  res.status(200).json({
    message: "Server is running and the test endpoint is working!",
  });
});

router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  console.log("name", name);
  console.log("email", email);
  console.log("password", password);

  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Error registering user",
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

    res.status(200).json({ token, user }); //TODO remove password from user object
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
