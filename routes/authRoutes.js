import { Router } from "express";
import { register, login, me } from "../controllers/authController.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();

// נתיב לרישום משתמש חדש
router.post("/register", register);

// נתיב להתחברות משתמש קיים
router.post("/login", login);

// נתיב לקבלת פרטי המשתמש המחובר - דורש אימות טוקן קודם
router.get("/me", verifyJWT, me);

export default router;