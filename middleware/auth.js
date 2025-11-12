import jwt from "jsonwebtoken";

// מידלוויר לאימות טוקני JWT בבקשות נכנסות.
export function verifyJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    // מוודאים שיש כותרת Authorization בפורמט "Bearer <token>".
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "נדרש טוקן אימות תקין." });
    }

    const token = authHeader.split(" ")[1]; // מבודדים את הטוקן מהכותרת.

    // מאמתים את הטוקן באמצעות המפתח הסודי.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // שומרים את ה-ID של המשתמש (שנשלף מהטוקן) על אובייקט הבקשה.
    req.userId = decoded.sub;

    // ממשיכים לבקר הבא.
    next();
  } catch (error) {
    // מטפלים בשגיאות אימות (טוקן לא חוקי, פג תוקף וכו').
    console.error("שגיאת אימות טוקן:", error.message);
    res.status(401).json({ message: "טוקן אימות אינו חוקי או שפג תוקפו." });
  }
}