import { validationResult } from "express-validator";
import { userModel } from "../models/User.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
export async function registerUser(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array() });
  }

  try {
    const { fullName, email, password } = req.body;
    const isUserExist = await userModel.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ message: "User alredy exist " });
    }
    // password hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!fullName || !email || !password) {
      res.status(400).json({ message: "all fileds are required " });
      throw new Error("All fileds are required ");
    }
    const newUser = {
      fullName,
      email,
      password: hashedPassword,
    };

    const createUser = await userModel.create(newUser);
    const token = jwt.sign({ id: createUser.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(201).json({ createUser, token });
    next();
  } catch (err) {
    console.log(err);
  }
}

export async function loginUser(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array() });
  }

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("All fileds are required");
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({ message: "Invalid Email or password " });
    }

    const compareData = await bcrypt.compare(password, user.password);
    if (!compareData) {
      return res.status(401).json({ message: "Invalid emial or password" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 360000,
    });
    res.status(200).json({ token, user });
    next();
  } catch (err) {
    console.log(err);
  }
}

export const userProfileData = (req, res) => {
  res.status(200).json(req.user);
};

export const logoutUser= (req,res)=>{
  res.clearCookie("token")
  res.status(200).json({message:"Logged out "})
}