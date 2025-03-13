import jwt from "jsonwebtoken";
import { userModel } from "../models/User.model.js";
export async function userAuth(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unautherized" });
  }

  try {
    const id = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(id.id);
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
