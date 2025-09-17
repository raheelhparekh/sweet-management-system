import asyncHandler from "express-async-handler";
import User from "../models/User.models.js";
import generateToken from "../utils/generateToken.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    username,
    password,
  });

  if (user) {
    generateToken(res, user._id, user.isAdmin);
    res.status(201).json({
      _id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id, user.isAdmin);
    res.json({
      _id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error("Invalid username or password");
  }
});

export { registerUser, authUser };
