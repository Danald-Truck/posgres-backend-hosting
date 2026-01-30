import express from "express";
import { db } from "../db.js";
import { users } from "../schemas/user.schema.js";
import { eq } from "drizzle-orm";

export const router = express.Router();

router.post(`/register`, async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name || !email.includes('@')) {
    return res.status(401).send({
      status: 401,
      message: "All fields are required",
    });
  }

  // check if user exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  
  if (existingUser.length > 0) {
    return res.status(400).send({
      status: 400,
      message: "User already exists!",
    });
  }

  //   create new user
  const newUser = await db
    .insert(users)
    .values({ name, email, password })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    });

  res.status(201).send({
    status: 201,
    message: "User created successfully",
    values: newUser,
  });
});
