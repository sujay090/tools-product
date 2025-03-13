import express from "express";
import { body } from "express-validator";
import { loginUser, registerUser, userProfileData } from "../controllers/user.controller.js";
import { userAuth } from "../middlewares/userAuth.js";

const router = express.Router();

router.post("/register", [
  body("fullName")
    .isLength({ min: 3 })
    .withMessage("Full Name must be at least 3 chrecter long"),
  body("email").isEmail().withMessage("Invalide Email "),
  body("password")
    .isLength({ min: 3 })
    .withMessage("password must be at least 3 charecters long "),
],registerUser);

router.post("/login", [
    body("email").isEmail().withMessage("Invalide Email "),
    body("password")
      .isLength({ min: 3 })
      .withMessage("password must be at least 3 charecters long "),
  ],loginUser);

  router.get("/profile",userAuth,userProfileData)
export default router;
