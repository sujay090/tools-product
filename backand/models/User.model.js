import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    minlength: [3, "must name must be least 3 chracters long ❌"],
    maxlength: 255,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: [5, "Email must be at least 5 characters long"],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

export const userModel = mongoose.model("User", userSchema);
