import mongoose from "mongoose";

export async function connectDB() {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("connect Database ✅✅");
    })
    .catch((err) => {
      console.log(err.message);
    });
}
