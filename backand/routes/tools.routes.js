import express from "express";
import multer from "multer";
import { body } from "express-validator";
import { uploadFile } from "../controllers/tools.controller.js";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/image-uploads",
  upload.single("image"),
  [
    body("image").custom((value, { req }) => {
        if (!req.file) {
        throw new Error("No file uploaded");
      }
      return true;
    }),
  ],
  uploadFile
);

export default router