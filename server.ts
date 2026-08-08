import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

const DATA_DIR = path.join(process.cwd(), "data");
const QUESTIONS_FILE = path.join(DATA_DIR, "questions.json");
const RESULTS_FILE = path.join(DATA_DIR, "results.json");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Admin & OTP Config
const defaultConfig = {
  adminUsername: "admin",
  adminPasswordHash: "123456789", // default password requested by user
  globalOtp: "123456", // default 6-digit OTP for student test entry
};

if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), "utf-8");
}

if (!fs.existsSync(RESULTS_FILE)) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify([], null, 2), "utf-8");
}

// Helper functions
function getConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return defaultConfig;
  }
}

function saveConfig(cfg: any) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), "utf-8");
}

function getResults() {
  try {
    const raw = fs.readFileSync(RESULTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function saveResults(res: any[]) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(res, null, 2), "utf-8");
}

// Questions persistence (falls back to app initialization if empty)
function getQuestionsData() {
  if (fs.existsSync(QUESTIONS_FILE)) {
    try {
      const raw = fs.readFileSync(QUESTIONS_FILE, "utf-8");
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }
  return null;
}

function saveQuestionsData(data: any) {
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// API ENDPOINTS

// 1. Get current config (for verifying OTP on student login)
app.get("/api/config/otp-check", (req, res) => {
  const cfg = getConfig();
  res.json({ otpRequired: true });
});

app.post("/api/student/verify-otp", (req, res) => {
  const { otp } = req.body;
  const cfg = getConfig();
  if (otp && String(otp).trim() === String(cfg.globalOtp).trim()) {
    return res.json({ success: true, message: "OTP Verified successfully!" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid OTP Code. Please request valid OTP from school admin." });
  }
});

// 2. Questions API
app.get("/api/questions", (req, res) => {
  const savedData = getQuestionsData();
  res.json({ questions: savedData });
});

app.post("/api/questions", (req, res) => {
  const { questionsData } = req.body;
  if (!questionsData) {
    return res.status(400).json({ error: "No question data provided" });
  }
  saveQuestionsData(questionsData);
  res.json({ success: true, message: "Question bank updated and saved successfully!" });
});

// 3. Save Student Test Result (Only if logged in with OTP)
app.post("/api/student/save-result", (req, res) => {
  const resultData = req.body;
  if (!resultData || !resultData.isLoggedIn) {
    return res.json({ saved: false, message: "Practice mode test - no local record saved." });
  }

  const results = getResults();
  const newRecord = {
    id: "RES_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    formattedTime: new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
    studentName: resultData.studentName || "Anonymous Student",
    studentClass: resultData.studentClass || "N/A",
    subjectName: resultData.subjectName || "N/A",
    selectedChapters: resultData.selectedChapters || [],
    totalQuestions: resultData.totalQuestions || 0,
    correctAnswers: resultData.correctAnswers || 0,
    wrongAnswers: resultData.wrongAnswers || 0,
    skippedQuestions: resultData.skippedQuestions || 0,
    scorePercentage: resultData.scorePercentage || 0,
    timeTakenSeconds: resultData.timeTakenSeconds || 0,
    credentialsUsed: {
      otp: resultData.otp || "N/A"
    }
  };

  results.unshift(newRecord);
  saveResults(results);
  res.json({ success: true, message: "Test result saved in school records!", record: newRecord });
});

// 4. Admin Authentication & Management
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const cfg = getConfig();
  if (username === cfg.adminUsername && password === cfg.adminPasswordHash) {
    return res.json({ success: true, token: "ADMIN_AUTH_TOKEN_SECRET_SESSION" });
  } else {
    return res.status(401).json({ success: false, message: "Invalid Admin Username or Password" });
  }
});

app.get("/api/admin/config", (req, res) => {
  const cfg = getConfig();
  res.json({ adminUsername: cfg.adminUsername, globalOtp: cfg.globalOtp });
});

app.post("/api/admin/update-credentials", (req, res) => {
  const { newUsername, newPassword, newOtp } = req.body;
  const cfg = getConfig();
  if (newUsername) cfg.adminUsername = newUsername;
  if (newPassword) cfg.adminPasswordHash = newPassword;
  if (newOtp) cfg.globalOtp = newOtp;

  saveConfig(cfg);
  res.json({ success: true, message: "Admin credentials and Student OTP updated successfully!" });
});

app.get("/api/admin/results", (req, res) => {
  const results = getResults();
  res.json({ results });
});

app.delete("/api/admin/results/:id", (req, res) => {
  const id = req.params.id;
  let results = getResults();
  results = results.filter((r: any) => r.id !== id);
  saveResults(results);
  res.json({ success: true, message: "Result record deleted." });
});

app.delete("/api/admin/results-clear-all", (req, res) => {
  saveResults([]);
  res.json({ success: true, message: "All student test result records cleared." });
});

// VITE MIDDLEWARE SETUP
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
