import { Router } from "express";
import { User } from "../models/User.js";

const router = Router();

// --- נתיב GET: קבלת רשימת משתמשים ---
router.get("/", async (_req, res) => {
  try {
    // מוצאים את כל המשתמשים, בוחרים רק אימייל ותאריך יצירה, וממיינים לפי תאריך יצירה יורד.
    const users = await User.find({}, "email createdAt").sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (err) {
    console.error("שגיאה בשליפת משתמשים:", err);
    res.status(500).json({ message: err.message || "שגיאה בשרת" });
  }
});

// --- נתיב POST: יצירת משתמש חדש ---
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "חובה לשלוח אימייל וסיסמה" });
    }

    // בודקים אם המשתמש כבר קיים.
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "משתמש כבר קיים" });

    // מצפינים את הסיסמה ויוצרים את המשתמש.
    const passwordHash = await User.hashPassword(password);
    await User.create({ email, passwordHash });
    res.status(201).json({ message: "נוצר משתמש חדש בהצלחה" });
  } catch (err) {
    console.error("שגיאה ביצירת משתמש:", err);
    res.status(500).json({ message: err.message || "שגיאה בשרת" });
  }
});

// --- נתיב POST: שינוי סיסמה ---
router.post("/change-password", async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body || {};
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "חסרים פרטים: אימייל, סיסמה נוכחית או סיסמה חדשה" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "הסיסמה החדשה חייבת להיות לפחות 6 תווים" });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ message: "הסיסמה החדשה חייבת להיות שונה מהנוכחית" });
    }

    // מוצאים את המשתמש לפי האימייל.
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "משתמש לא נמצא" });

    // מאמתים את הסיסמה הנוכחית.
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ message: "הסיסמה הנוכחית שגויה" });

    // מצפינים ושומרים את הסיסמה החדשה.
    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();
    res.json({ message: "הסיסמה עודכנה בהצלחה" });
  } catch (err) {
    console.error("שגיאה בשינוי סיסמה:", err);
    res.status(500).json({ message: err.message || "שגיאה בשרת" });
  }
});

// --- נתיב DELETE: מחיקת משתמש ---
router.delete("/", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "חובה לשלוח אימייל וסיסמה" });
    }

    // מוצאים את המשתמש לפי האימייל.
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "משתמש לא נמצא" });

    // מאמתים את הסיסמה.
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "הסיסמה שגויה" });

    // מוחקים את המשתמש.
    await User.deleteOne({ _id: user._id });
    res.json({ message: "המשתמש נמחק בהצלחה" });
  } catch (err) {
    console.error("שגיאה במחיקת משתמש:", err);
    res.status(500).json({ message: err.message || "שגיאה בשרת" });
  }
});

export default router;