import express from "express";
import bcrypt from "bcrypt";
import { db } from "../db.js";
import { users } from "../schemas/user.schema.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        status: 400,
        message: "All fields are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: 400,
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email));

    if (existingUser.length > 0) {
      return res.status(409).json({
        status: 409,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [newUser] = await db
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
        })
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          createdAt: users.createdAt,
        });

    return res.status(201).json({
      status: 201,
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);

    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: "Email and password are required",
      });
    }

    const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          password: users.password,
        })
        .from(users)
        .where(eq(users.email, email));

    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
        {
          sub: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "15m",
        }
    );

    return res.status(200).json({
      status: 200,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
});
