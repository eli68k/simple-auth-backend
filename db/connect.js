import mongoose from "mongoose";

// פונקציה להתחברות למסד הנתונים של MongoDB
export const connectDB = async (mongoUri) => {
  // מוודאים שקיבלנו מחרוזת חיבור
  if (!mongoUri) throw new Error("חסר MONGO_URI בקובץ ה-.env");
  // מתחברים ל-MongoDB
  await mongoose.connect(mongoUri);
  console.log("✅ התחברנו ל-MongoDB בהצלחה!");
};

// מטפלים בסגירה נקייה של החיבור למסד הנתונים
// כשמכבים את השרת (לדוגמה, עם Ctrl+C), נסגור את החיבור ל-MongoDB.
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🔌 חיבור ל-MongoDB נסגר.");
  process.exit(0);
});