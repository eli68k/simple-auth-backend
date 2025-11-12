import mongoose from "mongoose";
import bcrypt from "bcrypt";

// מגדירים את מבנה המשתמש במסד הנתונים
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // כל אימייל חייב להיות יחיד
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true, // הסיסמה המוצפנת
    },
  },
  { timestamps: true } // מתי נוצר ומתי עודכן
);

// --- פונקציות עזר סטטיות ---
// פונקציה להצפנת סיסמה
userSchema.statics.hashPassword = async function (plainPassword) {
  if (!plainPassword || plainPassword.length < 6) {
    throw new Error("הסיסמה חייבת להכיל לפחות 6 תווים.");
  }
  return bcrypt.hash(plainPassword, 10); // 10 זו רמת ההצפנה
};

// --- פונקציות עזר של אינסטנס ---
// פונקציה להשוואת סיסמה שהוזנה מול הסיסמה המוצפנת השמורה
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// מייצאים את מודל המשתמש
export const User = mongoose.model("User", userSchema);