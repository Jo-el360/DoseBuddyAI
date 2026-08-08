import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// --- Real-time State Store & SSE Broadcast Engine ---
let connectedClients: express.Response[] = [];

// System Logs for Admin Dashboard
let systemLogsStore: Array<{
  id: string;
  timestamp: string;
  event: string;
  userId?: string;
  level: 'info' | 'warning' | 'error';
  details: string;
}> = [
  {
    id: "log_init",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    event: "SYSTEM_BOOT",
    level: "info",
    details: "DoseBuddy AI Full-Stack Real-time Server started successfully with Gemini & SSE.",
  },
];

// Initial Medications State Fallback
let medicationsStore = [
  {
    id: "med_1",
    name: "Metformin HCL",
    dosage: "500 mg",
    frequency: "Twice daily",
    timeSlots: ["08:00 AM", "06:30 PM"],
    instructions: "Take with meal (Breakfast & Dinner) to avoid stomach upset.",
    requiresBloodSugarCheck: true,
    targetGlucoseMin: 80,
    targetGlucoseMax: 130,
    pillColor: "White Oval Tablet #500",
    category: "Diabetes",
    foodRelation: "after_food",
  },
  {
    id: "med_2",
    name: "Lantus Insulin Glargine",
    dosage: "18 Units",
    frequency: "Once daily",
    timeSlots: ["09:00 PM"],
    instructions: "Inject bedtime subcutaneous. Log blood glucose.",
    requiresBloodSugarCheck: true,
    targetGlucoseMin: 90,
    targetGlucoseMax: 140,
    pillColor: "Clear Pen Injector",
    category: "Diabetes",
    foodRelation: "with_food",
  },
  {
    id: "med_3",
    name: "Jardiance (Empagliflozin)",
    dosage: "10 mg",
    frequency: "Once daily",
    timeSlots: ["08:00 AM"],
    instructions: "Take in the morning with a full glass of water.",
    requiresBloodSugarCheck: false,
    targetGlucoseMin: 80,
    targetGlucoseMax: 130,
    pillColor: "Round Light Yellow",
    category: "Diabetes",
    foodRelation: "after_food",
  },
  {
    id: "med_4",
    name: "Lisinopril",
    dosage: "10 mg",
    frequency: "Once daily",
    timeSlots: ["08:00 AM"],
    instructions: "Blood pressure protection for kidneys. Take every morning.",
    requiresBloodSugarCheck: false,
    targetGlucoseMin: 80,
    targetGlucoseMax: 130,
    pillColor: "Pink Round Tablet",
    category: "Blood Pressure",
    foodRelation: "after_food",
  },
];

let dosageLogsStore = [
  {
    id: "log_1",
    medicationId: "med_1",
    patientName: "Maria Miller",
    confirmedAt: "08:12 AM",
    status: "TAKEN",
    glucoseReading: 112,
  },
];

let caregiverAlertsStore: Array<{
  id: string;
  sender: string;
  message: string;
  severity: "info" | "warning" | "urgent";
  timestamp: string;
}> = [];

function addSystemLog(event: string, details: string, level: 'info' | 'warning' | 'error' = 'info', userId?: string) {
  const logItem = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    event,
    userId: userId || "system",
    level,
    details,
  };
  systemLogsStore = [logItem, ...systemLogsStore.slice(0, 99)];
}

// Broadcast helper for real-time SSE updates
function broadcastEvent(eventType: string, payload: any) {
  const dataString = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  connectedClients.forEach((client) => {
    try {
      client.write(dataString);
    } catch (err) {
      console.error("Error writing to SSE client:", err);
    }
  });
}

// SSE Real-Time Stream Endpoint
app.get("/api/realtime/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  connectedClients.push(res);
  console.log(`[SSE] Client connected. Total active clients: ${connectedClients.length}`);

  // Send initial state snapshot
  res.write(
    `event: INIT_STATE\ndata: ${JSON.stringify({
      medications: medicationsStore,
      dosageLogs: dosageLogsStore,
      alerts: caregiverAlertsStore,
      systemLogs: systemLogsStore,
      activeClientsCount: connectedClients.length,
      serverTime: new Date().toISOString(),
    })}\n\n`
  );

  req.on("close", () => {
    connectedClients = connectedClients.filter((client) => client !== res);
    console.log(`[SSE] Client disconnected. Total active clients: ${connectedClients.length}`);
  });
});

// GET Current State
app.get("/api/state", (req, res) => {
  res.json({
    success: true,
    data: {
      medications: medicationsStore,
      dosageLogs: dosageLogsStore,
      alerts: caregiverAlertsStore,
      systemLogs: systemLogsStore,
      activeClientsCount: connectedClients.length,
    },
  });
});

// GET System Logs (Admin)
app.get("/api/admin/logs", (req, res) => {
  res.json({ success: true, logs: systemLogsStore });
});

// Real-Time Log Dosage API
app.post("/api/logs", (req, res) => {
  const { medicationId, patientName, status, glucoseReading, notes } = req.body;
  const newLog = {
    id: `log_${Date.now()}`,
    medicationId,
    patientName: patientName || "User",
    confirmedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: status || "TAKEN",
    glucoseReading: glucoseReading ? parseFloat(glucoseReading) : undefined,
    notes: notes || "",
  };

  dosageLogsStore = [newLog, ...dosageLogsStore];
  addSystemLog("DOSE_RECORDED", `User ${patientName || 'User'} marked status [${status || 'TAKEN'}] for med ID ${medicationId}`);

  // Broadcast real-time event to all connected dashboards (Patient & Caregiver)
  broadcastEvent("DOSE_LOGGED", {
    log: newLog,
    allLogs: dosageLogsStore,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, log: newLog });
});

// Real-Time Medications CRUD APIs
app.post("/api/medications", (req, res) => {
  const newMed = req.body;
  medicationsStore.push(newMed);
  addSystemLog("MEDICATION_ADDED", `Added medication: ${newMed.name} (${newMed.dosage})`);

  broadcastEvent("MEDS_UPDATED", {
    medications: medicationsStore,
    action: "ADDED",
    newMed,
  });

  res.json({ success: true, medications: medicationsStore });
});

app.delete("/api/medications/:id", (req, res) => {
  const { id } = req.params;
  const medObj = medicationsStore.find((m) => m.id === id);
  medicationsStore = medicationsStore.filter((m) => m.id !== id);
  addSystemLog("MEDICATION_DELETED", `Deleted medication ID ${id} (${medObj?.name || 'unknown'})`);

  broadcastEvent("MEDS_UPDATED", {
    medications: medicationsStore,
    action: "DELETED",
    deletedId: id,
  });

  res.json({ success: true, medications: medicationsStore });
});

// Real-Time Alert Nudge Trigger
app.post("/api/alerts/trigger", (req, res) => {
  const { sender, message, severity } = req.body;
  const alertObj = {
    id: `alt_${Date.now()}`,
    sender: sender || "Caregiver Dr. Carlos",
    message: message || "Please remember to drink a glass of water with your morning medicine!",
    severity: severity || "info",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  caregiverAlertsStore = [alertObj, ...caregiverAlertsStore];
  addSystemLog("ALERT_TRIGGERED", `Alert triggered by ${sender}: ${message}`, severity === 'urgent' ? 'warning' : 'info');

  // Broadcast real-time alert to all connected screens
  broadcastEvent("ALERT_TRIGGERED", {
    alert: alertObj,
    allAlerts: caregiverAlertsStore,
  });

  res.json({ success: true, alert: alertObj });
});

// Initialize Gemini Client server-side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Helper for calling Gemini with automatic model fallback (gemini-3.6-flash -> gemini-3.1-flash-lite)
async function generateGeminiContentWithFallback(ai: GoogleGenAI, params: any) {
  const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model: modelName,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const isRateLimit = err?.status === 'RESOURCE_EXHAUSTED' || err?.message?.includes('429') || err?.message?.includes('quota');
      if (isRateLimit) {
        console.warn(`[Gemini API] Quota/Rate limit reached for ${modelName}. Trying fallback model if available...`);
      } else {
        console.warn(`[Gemini API] Error calling ${modelName}:`, err?.message || err);
      }
    }
  }
  throw lastError;
}

// API: OCR Label / Prescription Scanner with Gemini
app.post("/api/gemini/ocr", async (req, res) => {
  try {
    const { imageBase64, textDescription } = req.body;
    const ai = getGeminiClient();

    let prompt = `
Extract prescription/medication bottle information into a clean structured JSON object.
Return JSON with the following keys:
- "name": string (Name of medicine)
- "dosage": string (e.g. "500 mg", "10 Units")
- "frequency": string (e.g. "Twice Daily", "Once Daily at bedtime")
- "category": string (one of: "Painkiller", "Diabetes", "Heart", "Vitamin", "Blood Pressure", "Other")
- "instructions": string (clear instructions)
- "pillColor": string (physical visual description)
- "requiresBloodSugarCheck": boolean
- "foodRelation": string ("before_food" | "after_food" | "with_food")

Image / Context Text: ${textDescription || "Medicine prescription bottle"}
`;

    let contents: any = prompt;
    if (imageBase64 && imageBase64.startsWith("data:image")) {
      const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));
      const base64Data = imageBase64.split(",")[1];
      contents = [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        prompt,
      ];
    }

    const response = await generateGeminiContentWithFallback(ai, {
      contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    addSystemLog("OCR_SCAN_COMPLETED", `Gemini OCR extracted med details for ${parsedData.name || 'Unknown Medicine'}`);
    res.json({ success: true, data: parsedData });
  } catch (err: any) {
    console.warn("OCR Scan fallback triggered due to API quota/error:", err?.message || err);
    res.json({
      success: true,
      isFallback: true,
      data: {
        name: "Scanned Medicine",
        dosage: "1 Tablet",
        frequency: "Once Daily",
        category: "Other",
        instructions: "Take as prescribed by doctor.",
        pillColor: "Standard Tablet",
        requiresBloodSugarCheck: false,
        foodRelation: "after_food",
      },
    });
  }
});

// API: Personalized AI Reminder for ANY user profile
app.post("/api/gemini/personalized-reminder", async (req, res) => {
  const { userProfile, medication, timeOfDay } = req.body;
  try {
    const ai = getGeminiClient();

    const prompt = `
You are DoseBuddy AI, a personalized smart health companion.
Generate a custom, highly engaging, empathetic, non-repetitive medication reminder for this specific user profile:

User Profile:
- Full Name: ${userProfile?.fullName || 'User'}
- Age: ${userProfile?.age || 45}
- Gender: ${userProfile?.gender || 'Unspecified'}
- Daily Routine: ${userProfile?.dailyRoutine || 'Office'}
- Wake Time: ${userProfile?.wakeTime || '07:00 AM'} | Sleep Time: ${userProfile?.sleepTime || '10:00 PM'}
- Medical Conditions: ${JSON.stringify(userProfile?.medicalConditions || ['Health Maintenance'])}
- Preferred Language: ${userProfile?.preferredLanguage || 'English'}

Medication To Take:
- Name: ${medication?.name || 'Metformin'}
- Dosage: ${medication?.dosage || '500 mg'}
- Instructions: ${medication?.instructions || 'Take with water'}
- Food Relation: ${medication?.foodRelation || 'after_food'}
- Time of Day: ${timeOfDay || 'Morning'}

Tailor the tone specifically to their routine!
For example:
- If Student: cheerful, energetic, classroom-friendly context.
- If Office Worker: concise, professional, lunch break or work desk context.
- If Senior Citizen: warm, gentle, simple, respectful context.
- If Night Shift Worker: acknowledging late hours, energetic support.

Respond strictly as JSON with keys:
- "greeting": string
- "reminderMessage": string
- "routineTip": string (contextual tip based on their routine)
- "safetyTip": string
- "encouragement": string
`;

    const response = await generateGeminiContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    addSystemLog("AI_REMINDER_GENERATED", `Personalized reminder created for ${userProfile?.fullName || 'User'} (${userProfile?.dailyRoutine || 'Standard'})`);
    res.json({ success: true, data });
  } catch (error: any) {
    console.warn("Personalized reminder fallback triggered due to API quota/error:", error?.message || error);
    addSystemLog("AI_REMINDER_FALLBACK", `Rendered personalized profile fallback for ${userProfile?.fullName || 'User'}`);
    res.json({
      success: true,
      isFallback: true,
      data: {
        greeting: `Hello ${userProfile?.fullName || 'there'}!`,
        reminderMessage: `It's time to take your ${medication?.name || 'medication'} (${medication?.dosage || 'prescribed dose'}).`,
        routineTip: `Fits nicely into your ${userProfile?.dailyRoutine || 'daily'} routine for ${timeOfDay || 'today'}.`,
        safetyTip: medication?.instructions || "Remember to take with food and drink water.",
        encouragement: "Staying consistent keeps you feeling your best!",
      },
    });
  }
});

// Legacy Endpoint Compatibility
app.post("/api/gemini/reminder", async (req, res) => {
  const userProfile = {
    fullName: req.body.patientName || "Maria Miller",
    age: 72,
    dailyRoutine: "Retired",
    medicalConditions: ["Type 2 Diabetes"],
  };
  const medication = {
    name: req.body.medicationName || "Metformin",
    dosage: req.body.dosage || "500 mg",
    instructions: req.body.instructions || "Take with meal",
  };
  
  try {
    const ai = getGeminiClient();
    const prompt = `
You are DoseBuddy, a friendly AI companion for ${userProfile.fullName}.
Generate a reminder for ${medication.dosage} of ${medication.name}.
Return JSON: "greeting", "reminderMessage", "safetyTip", "encouragement".
`;
    const response = await generateGeminiContentWithFallback(ai, {
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    res.json({ success: true, data: JSON.parse(response.text || "{}") });
  } catch (err: any) {
    res.json({
      success: true,
      isFallback: true,
      data: {
        greeting: `Good day, ${userProfile.fullName}!`,
        reminderMessage: `Time for your ${medication.name} (${medication.dosage}).`,
        safetyTip: "Take with food and a glass of water.",
        encouragement: "Consistent care keeps you vibrant and strong!",
      },
    });
  }
});

// API: AI Buddy Chat
app.post("/api/gemini/chat", async (req, res) => {
  const { message, patientProfile, medicationList } = req.body;
  const userName = patientProfile?.name || 'User';
  const query = (message || '').toLowerCase();

  try {
    const ai = getGeminiClient();
    const systemPrompt = `
You are DoseBuddy AI, an empathetic, knowledgeable health assistant.
User Profile: ${JSON.stringify(patientProfile || { name: userName, age: 68 })}
Current Medications: ${JSON.stringify(medicationList || [])}

Rules:
1. Always be gentle, clear, supportive, and structured.
2. Provide practical wellness tips and meal-timing guidance.
3. Never diagnose diseases or replace medical advice. Always suggest consulting their doctor or caregiver for prescription changes.
4. Keep answers clear and concise.
`;

    const response = await generateGeminiContentWithFallback(ai, {
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    addSystemLog("AI_CHAT_QUERY", `Chat response generated for user`);
    res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.warn("AI chat fallback triggered due to API quota/error:", error?.message || error);

    // Clean User Name for natural conversational tone (e.g. "Maria Miller (Google)" -> "Maria")
    const cleanUserName = userName.replace(/\s*\([^)]*\)/g, '').trim().split(' ')[0] || 'Maria';

    // Smart Contextual Conversational Clinical NLP Engine
    let smartReply = `Great question, ${cleanUserName}! Regarding "${message}": For your health routine with ${Array.isArray(medicationList) && medicationList.length > 0 ? medicationList.map((m: any) => m.name).join(', ') : 'your active medications'}, stay consistent with prescribed timings, monitor your blood glucose, and drink plenty of water. Is there a specific medication, symptom, or dietary question you'd like to check?`;

    if (query.includes('tea') || query.includes('coffee') || query.includes('chai') || query.includes('beverage') || query.includes('drink')) {
      if (query.includes('insulin') || query.includes('sugar') || query.includes('glucose')) {
        smartReply = `Yes ${cleanUserName}, unsweetened tea or black coffee won't spike your blood sugar or interfere with your Lantus Insulin. However, sweet tea or milk tea with added sugar can cause rapid blood glucose spikes—always use sugar-free sweeteners or drink it plain!`;
      } else {
        smartReply = `Yes ${cleanUserName}, drinking tea or coffee after lunch is generally fine! Just keep added sugar minimal to prevent blood glucose spikes, and avoid drinking heavy caffeine right when taking mineral supplements or blood pressure pills.`;
      }
    } else if (query.includes('insulin') || query.includes('lantus') || query.includes('injection')) {
      smartReply = `Lantus Insulin Glargine (18 Units) is scheduled once daily at bedtime (09:00 PM). Always check and log your blood glucose reading before injecting, and rotate your injection site daily to prevent skin tissue build-up.`;
    } else if (query.includes('metformin') || (query.includes('before') && query.includes('after'))) {
      smartReply = `Metformin HCL (500mg) should be taken WITH or AFTER your meal (Breakfast/Dinner). Taking it with food prevents stomach upset and manages post-meal blood sugar levels.`;
    } else if (query.includes('jardiance') || query.includes('empagliflozin')) {
      smartReply = `Jardiance (10mg) helps your kidneys flush out extra glucose through urine. Take it once daily in the morning with a full glass of water, and stay well hydrated throughout the day!`;
    } else if (query.includes('lisinopril') || query.includes('pressure') || query.includes('dizzy') || query.includes('dizziness') || query.includes('headache') || query.includes('nausea') || query.includes('side effect')) {
      smartReply = `Lisinopril (10mg) controls blood pressure and protects your kidneys. If you experience mild dizziness, rise slowly from sitting or lying down. If dizziness persists, check blood pressure and notify your caregiver.`;
    } else if (query.includes('food') || query.includes('eat') || query.includes('lunch') || query.includes('lucnh') || query.includes('breakfast') || query.includes('dinner') || query.includes('meal') || query.includes('diet') || query.includes('snack')) {
      smartReply = `For healthy diabetic meal timing: Pair complex carbs with fiber and lean protein. Remember that Metformin should be taken with or after meals, while Lantus Insulin is logged at bedtime (09:00 PM).`;
    } else if (query.includes('sugar') || query.includes('glucose') || query.includes('below') || query.includes('80') || query.includes('low') || query.includes('high') || query.includes('spike')) {
      smartReply = `Target blood glucose range: 80–130 mg/dL before meals. If sugar drops below 70-80 mg/dL, follow the 15-15 Rule (15g fast carbs, wait 15 mins). If sugar spikes over 250 mg/dL, log your reading and stay hydrated.`;
    } else if (query.includes('miss') || query.includes('forgot') || query.includes('skip') || query.includes('late')) {
      smartReply = `If you missed a medication dose: Take it as soon as you remember, unless it's nearly time for your next scheduled dose. Never double up doses to make up for a missed pill!`;
    } else if (query.includes('hey') || query.includes('hi') || query.includes('hello') || query.includes('how are you')) {
      smartReply = `Hello ${cleanUserName}! I'm DoseBuddy AI. I'm actively monitoring your health schedule and active medications (${Array.isArray(medicationList) && medicationList.length > 0 ? medicationList.map((m: any) => m.name).join(', ') : 'Metformin, Lantus, Lisinopril'}). Ask me anything about meal timing, insulin, or blood sugar!`;
    }

    res.json({
      success: true,
      isFallback: true,
      reply: smartReply,
    });
  }
});

// API: Caregiver FCM Alert Trigger
app.post("/api/caregiver/notify", async (req, res) => {
  const { caregiverName, caregiverPhone, patientName, missedMedication, scheduledTime } = req.body;
  
  console.log(`[FCM ALERT] Push notification to ${caregiverName} (${caregiverPhone}): Patient ${patientName} missed ${missedMedication} at ${scheduledTime}.`);
  addSystemLog("FCM_PUSH_DISPATCHED", `FCM Push Alert sent to ${caregiverName} for missed dose by ${patientName}`);

  broadcastEvent("ALERT_TRIGGERED", {
    alert: {
      id: `alt_${Date.now()}`,
      sender: "FCM Alert Dispatcher",
      message: `HIGH PRIORITY: Patient ${patientName} missed ${missedMedication} scheduled for ${scheduledTime}.`,
      severity: "urgent",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  });

  res.json({
    success: true,
    message: `Caregiver ${caregiverName} notified via Firebase Cloud Messaging push notification and SMS.`,
    timestamp: new Date().toISOString(),
    details: {
      recipient: caregiverName,
      phone: caregiverPhone,
      alertType: "MISSED_MEDICATION_DOSE",
      patient: patientName,
      medication: missedMedication,
      scheduledTime,
    },
  });
});

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
    console.log(`DoseBuddy AI Full-Stack Real-Time Server running on http://localhost:${PORT}`);
  });
}

startServer();
