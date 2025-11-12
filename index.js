// טעינת משתני סביבה
import "dotenv/config";

// מודולי בסיס לשרת
import express from "express";
import cors from "cors";
import morgan from "morgan";

// חיבור למסד הנתונים
import { connectDB } from "./db/connect.js";

// נתיבי אימות ומשתמשים
import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// מידלוורים בסיסיים ל־CORS, JSON ולוגים
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// דף בדיקה פשוט לוודא שהשרת חי
app.get("/", (_req, res) => {
  res.send("🔥 שרת האימות פעיל");
});

// בדיקה מהירה מהפרונט־אנד
app.get("/api/ping", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// נתיבי אימות (הרשמה/כניסה/רענון טוקן וכו')
app.use("/api/auth", authRoutes);

// נתיבי ניהול משתמשים (רשימה, יצירה, שינוי סיסמה, מחיקה)
app.use("/api/users", usersRoutes);

// טיפול בנתיבים שלא קיימים
app.use((_req, res) => {
  res.status(404).json({ message: "נתיב לא נמצא" });
});

// הפעלת השרת וחיבור לדאטהבייס
(async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    app.listen(PORT, () => {
      console.log(`🚀 השרת מאזין על פורט ${PORT}`);
    });

  } catch (err) {
    console.error("❌ שגיאה בהפעלת השרת:", err.message);
    process.exit(1);
  }
})();
