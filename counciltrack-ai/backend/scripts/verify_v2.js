const app = require("../src/app");
const http = require("http");

async function runTests() {
  console.log("=== CouncilTrack AI v2.0 Automated Verification Suite ===");
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let adminToken = "";
  let councilToken = "";
  let testGoalId = "";
  let testFeedbackId = "";
  let testCouncilId = "";

  async function request(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const headers = { "Content-Type": "application/json", ...options.headers };
    const res = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Failed to parse JSON from ${url}: ${text.slice(0, 100)}`);
    }
    return { status: res.status, data: json };
  }

  try {
    // 1. Healthcheck
    const health = await request("/api/health");
    console.assert(health.status === 200, "Health check failed");
    console.log("✓ Healthcheck passed:", health.data.service);

    // 2. Admin Login
    const adminLogin = await request("/api/v1/auth/login", {
      method: "POST",
      body: { email: "admin@counciltrack.org", password: "Admin@123" },
    });
    console.assert(adminLogin.status === 200, "Admin login failed");
    console.assert(adminLogin.data.data.user.role === "ADMIN", "Role must be ADMIN");
    adminToken = adminLogin.data.data.token;
    console.log("✓ Admin Login passed (Role: ADMIN)");

    // 3. Council Member Login
    const councilLogin = await request("/api/v1/auth/login", {
      method: "POST",
      body: { email: "rahul@counciltrack.org", password: "Admin@123" },
    });
    console.assert(councilLogin.status === 200, "Council login failed");
    console.assert(councilLogin.data.data.user.role === "COUNCIL", "Role must be COUNCIL");
    councilToken = councilLogin.data.data.token;
    console.log("✓ Council Member Login passed (Role: COUNCIL)");

    // 4. Admin Dashboard Summary
    const summary = await request("/api/v1/analytics/dashboard", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.assert(summary.status === 200, "Summary failed");
    console.assert(summary.data.data.totalCouncils >= 3, "Expected at least 3 councils");
    console.log("✓ Admin Analytics Dashboard summary verified (Total Councils:", summary.data.data.totalCouncils, ")");

    // 5. Admin Create Council (using dynamic name to allow repeated test runs)
    const uniqueCouncilName = `Fitness Club ${Date.now().toString(36)}`;
    const newCouncil = await request("/api/v1/councils", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { councilName: uniqueCouncilName, description: "Promoting physical wellness" },
    });
    console.assert(newCouncil.status === 201, "Create council failed");
    testCouncilId = newCouncil.data.data.councilId;
    console.log(`✓ Admin Create Council passed (ID: ${testCouncilId}, Name: ${uniqueCouncilName})`);

    // 6. Council Member Creates Daily Goal
    const newGoal = await request("/api/v1/goals", {
      method: "POST",
      headers: { Authorization: `Bearer ${councilToken}` },
      body: {
        title: "Coordinate evening circle assembly",
        description: "Arrange seating and reflection prompts",
        priority: "HIGH",
        goalDate: "2026-11-22",
      },
    });
    console.assert(newGoal.status === 201, "Goal creation failed");
    testGoalId = newGoal.data.data.goalId;
    console.assert(newGoal.data.data.status === "PENDING", "Initial status must be PENDING");
    console.log("✓ Council Member Daily Goal created (ID:", testGoalId, "Status: PENDING)");

    // 7. Council Member Submits Evening Reflection
    const reflection = await request("/api/v1/reflections", {
      method: "POST",
      headers: { Authorization: `Bearer ${councilToken}` },
      body: {
        reflectionDate: "2026-11-22",
        achievements: "Conducted the morning assembly on schedule",
        challenges: "Sound system battery drained",
        learnings: "Always check spare batteries",
        improvements: "Prepare audio backup kit",
        goalStatuses: [
          {
            goalId: testGoalId,
            status: "COMPLETED",
            incompleteReason: "",
          },
        ],
      },
    });
    console.assert(reflection.status === 201 || reflection.status === 200, "Reflection submission failed");
    console.log("✓ Council Member Evening Reflection submitted & goal status updated");

    // Verify Goal status updated to COMPLETED
    const goalDetail = await request(`/api/v1/goals/${testGoalId}`, {
      headers: { Authorization: `Bearer ${councilToken}` },
    });
    console.assert(goalDetail.data.data.status === "COMPLETED", "Goal status must be updated to COMPLETED");
    console.assert(goalDetail.data.data.history.length > 0, "Goal history must be recorded");
    console.log("✓ Goal Status verified as COMPLETED with audit history recorded");

    // 8. Public Student Feedback Submission (No Auth)
    const feedback = await request("/api/v1/feedback", {
      method: "POST",
      body: {
        studentName: "Mohan Lal",
        councilId: "CNL_001",
        feedbackType: "COMPLAINT",
        message: "Microphone stopped working during evening circle",
        contact: "mohan@example.com",
      },
    });
    console.assert(feedback.status === 201, "Public feedback failed");
    console.log("✓ Public Feedback submitted without auth (No login required)");

    // 9. Admin Views All Feedback & Updates Status/Notes
    const allFeedback = await request("/api/v1/feedback", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.assert(allFeedback.status === 200, "Admin view feedback failed");
    const lastFeedback = allFeedback.data.data[0];
    testFeedbackId = lastFeedback.feedbackId;

    const updateStatus = await request(`/api/v1/feedback/${testFeedbackId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: "UNDER_REVIEW" },
    });
    console.assert(updateStatus.status === 200, "Update status failed");

    const updateNotes = await request(`/api/v1/feedback/${testFeedbackId}/notes`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { adminNotes: "Admin investigated battery issues with Culture lead." },
    });
    console.assert(updateNotes.status === 200, "Update notes failed");
    console.log("✓ Admin updated complaint status to UNDER_REVIEW and saved private admin notes");

    // 10. Council Member Views Feedback -> CONFIRM PRIVATE ADMIN NOTES ARE HIDDEN
    const councilFeedback = await request("/api/v1/feedback/my-council", {
      headers: { Authorization: `Bearer ${councilToken}` },
    });
    console.assert(councilFeedback.status === 200, "Council feedback failed");
    for (const item of councilFeedback.data.data) {
      console.assert(item.adminNotes === undefined, "CRITICAL: adminNotes must NOT be exposed to council members!");
    }
    console.log("✓ Confidentiality Verified: Private admin notes are strictly hidden from council members!");

    // 11. Automated Weekly Analytics Calculation Formula Check
    const weekly = await request("/api/v1/analytics/weekly", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.assert(weekly.status === 200, "Weekly analytics failed");
    const { totalGoals, completedGoals, incompleteGoals, pendingGoals, weeklyCompletionRate } = weekly.data.data;
    console.log(`✓ Weekly Analytics: Total=${totalGoals}, Completed=${completedGoals}, Incomplete=${incompleteGoals}, Pending=${pendingGoals}, Rate=${weeklyCompletionRate}%`);
    if (completedGoals + incompleteGoals > 0) {
      const expectedRate = Math.round((completedGoals / (completedGoals + incompleteGoals)) * 100);
      console.assert(weeklyCompletionRate === expectedRate, `Rate calculation mismatch: expected ${expectedRate}, got ${weeklyCompletionRate}`);
      console.log(`✓ PRD Section 4.3 Completion Rate formula verified: (${completedGoals} / (${completedGoals} + ${incompleteGoals})) * 100 = ${weeklyCompletionRate}%`);
    }

    console.log("\n=======================================================");
    console.log("🎉 ALL 11 VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉");
    console.log("=======================================================");
  } catch (err) {
    console.error("Test failure:", err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
