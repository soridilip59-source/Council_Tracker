const http = require("http");

function req(path, method = "GET", body = null, token = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: "localhost",
      port: 4000,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
    };
    const r = http.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(d) });
        } catch {
          resolve({ status: res.statusCode, body: d });
        }
      });
    });
    r.on("error", reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function runAiTests() {
  console.log("=== CouncilTrack AI Heuristic Features Test Suite ===\n");

  // 1. Council Member Login
  const councilLogin = await req("/api/v1/auth/login", "POST", {
    email: "rahul@counciltrack.org",
    password: "Admin@123",
  });
  if (councilLogin.status !== 200) throw new Error("Council login failed");
  const councilToken = councilLogin.body.data.token;
  console.log("✓ Council login successful");

  // 2. Test AI Goal Suggestions
  const suggestions = await req("/api/v1/goals/suggestions", "GET", null, councilToken);
  if (suggestions.status !== 200 || !Array.isArray(suggestions.body.data)) {
    throw new Error("Goal suggestions endpoint failed");
  }
  console.log(`✓ AI Goal Suggestions received: ${suggestions.body.data.length} suggestions`);
  console.log(`  Sample: [${suggestions.body.data[0].priority}] "${suggestions.body.data[0].title}"`);

  // 3. Test Reflection AI Feedback
  const today = new Date().toISOString().split("T")[0];
  const refSubmit = await req(
    "/api/v1/reflections",
    "POST",
    {
      reflectionDate: today,
      achievements: "Reviewed meal inventory and supervised daily kitchen operations thoroughly.",
      challenges: "Supplier delivery was delayed by 30 minutes in the morning.",
      learnings: "Need to establish buffer stock policy to avoid future delays.",
      improvements: "Will conduct weekly vendor reliability check every Friday.",
      goalStatuses: [],
    },
    councilToken
  );
  if (refSubmit.status !== 201 && refSubmit.status !== 200) {
    throw new Error("Reflection submission failed");
  }
  const aiAnalysis = refSubmit.body.data.aiAnalysis;
  if (!aiAnalysis || !aiAnalysis.headline || !aiAnalysis.feedback) {
    throw new Error("Reflection AI analysis missing or incomplete");
  }
  console.log(`✓ Reflection AI Analysis generated: "${aiAnalysis.headline}" (Tone: ${aiAnalysis.tone})`);
  console.log(`  Feedback: ${aiAnalysis.feedback}`);

  // 4. Test Weekly AI Insight
  const weekly = await req("/api/v1/analytics/weekly", "GET", null, councilToken);
  if (weekly.status !== 200 || !weekly.body.data?.aiInsight) {
    throw new Error("Weekly AI insight missing");
  }
  const insight = weekly.body.data.aiInsight;
  console.log(`✓ Weekly AI Insight calculated: ${insight.emoji} ${insight.summary}`);

  // 5. Admin Login & Smart Alerts
  const adminLogin = await req("/api/v1/auth/login", "POST", {
    email: "admin@counciltrack.org",
    password: "Admin@123",
  });
  if (adminLogin.status !== 200) throw new Error("Admin login failed");
  const adminToken = adminLogin.body.data.token;
  console.log("✓ Admin login successful");

  const alerts = await req("/api/v1/analytics/smart-alerts", "GET", null, adminToken);
  if (alerts.status !== 200 || !Array.isArray(alerts.body.data)) {
    throw new Error("Smart alerts endpoint failed");
  }
  console.log(`✓ AI Smart Alerts generated: ${alerts.body.data.length} alert(s) for admin`);
  if (alerts.body.data.length > 0) {
    const a = alerts.body.data[0];
    console.log(`  Alert: [${a.severity}] ${a.memberName} (${a.position}): ${a.message}`);
  }

  console.log("\n=======================================================");
  console.log("🎉 ALL 5 AI HEURISTIC TESTS PASSED SUCCESSFULLY! 🎉");
  console.log("=======================================================");
}

runAiTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
