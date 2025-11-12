import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// פונקציה פרטית ליצירת טוקן JWT.
const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

// --- בקר לרישום משתמש חדש ---
const register = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "אנא ספק אימייל וסיסמה." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "משתמש עם אימייל זה כבר קיים." });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ email, passwordHash });

    const token = signToken(user._id.toString());
    return res.status(201).json({ message: "נרשמת בהצלחה!", token });
  } catch (err) {
    console.error("שגיאה בתהליך הרישום:", err);
    return res.status(500).json({ message: err.message || "אירעה שגיאה בשרת." });
  }
};

// --- בקר להתחברות משתמש ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "משתמש לא נמצא." });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: "סיסמה שגויה." });
    }

    const token = signToken(user._id.toString());
    return res.json({ message: "התחברת בהצלחה!", token });
  } catch (err) {
    console.error("שגיאה בתהליך ההתחברות:", err);
    return res.status(500).json({ message: err.message || "אירעה שגיאה בשרת." });
  }
};

// --- בקר לשליפת פרטי המשתמש המחובר ---
const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("_id email createdAt");
    if (!user) {
      return res.status(404).json({ message: "פרטי משתמש לא נמצאו." });
    }
    return res.json(user);
  } catch (err) {
    console.error("שגיאה בשליפת פרטי המשתמש:", err);
    return res.status(500).json({ message: err.message || "אירעה שגיאה בשרת." });
  }
};

// ייצוא הפונקציות לשימוש בניתובים.
export { register, login, me };