import jwt from "jsonwebtoken";

const generateToken = (res, userId, isAdmin) => {
  const token = jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true for production to work with HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "None" : "strict", // 'None' for cross-site cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};

export default generateToken;
