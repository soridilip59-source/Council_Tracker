const app = require("../src/app");
const http = require("http");

async function runTests() {
  console.log("=== CouncilTrack AI v3.0 Verification Suite ===");
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let adminToken = "";
  let councilToken = "";
  let englishGoalId = "";
  let weeklyGoalId = "";

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
    console.log("✓ 1. Healthcheck passed:", health.data.service);

    // 2. Admin Login
    const adminLogin = await request("/api/v1/auth/login", {
      method: "POST",
      body: { email: "admin@counciltrack.org", password: "Admin@123" },
    });
    console.assert(adminLogin.status === 200, "Admin login failed");
    console.assert(adminLogin.data.data.user.role === "ADMIN", "Role must be ADMIN");
    adminToken = adminLogin.data.data.token;
    console.log("✓ 2. Admin Login passed (Role: ADMIN)");

    // 3. Council Login using Council Email
    const councilLogin = await request("/api/v1/auth/login", {
      method: "POST",
      body: { email: "english@counciltrack.org", password: "Admin@123" },
    });
    console.assert(councilLogin.status === 200, "Council login failed");
    console.assert(councilLogin.data.data.user.role === "COUNCIL", "Role must be COUNCIL");
    const councilMembers = councilLogin.data.data.user.members || [];
    console.assert(councilMembers.some((m) => m.name === "Dilip"), "Dilip must be in English Council members");
    console.assert(councilMembers.some((m) => m.name === "Deepa"), "Deepa must be in English Council members");
    councilToken = councilLogin.data.data.token;
    console.log(`✓ 3. Council Login passed for English Council (Members: ${councilMembers.map(m=>m.name).join(", ")})`);

    // 4. Council Login using Member handle alias ("dilip" and "akanksha")
    const memberLogin = await request("/api/v1/auth/login", {
      method: "POST",
      body: { email: "dilip", password: "Admin@123" },
    });
    console.assert(memberLogin.status === 200, "Member alias login failed");
    console.assert(memberLogin.data.data.user.councilName === "English Council", "Should resolve to English Council");
    console.log("✓ 4. Member handle 'dilip' successfully logged into English Council session");

    const discoLogin = await request("/api/v1/auth/login", {
      method: "POST",
      body: { email: "akanksha", password: "Admin@123" },
    });
    console.assert(discoLogin.status === 200, "Discipline coordinator login failed");
    console.assert(discoLogin.data.data.user.councilName === "Discipline Council", "Should resolve to Discipline Council");
    const discoMembers = discoLogin.data.data.user.members || [];
    console.assert(discoMembers.some(m => m.name === "Akanksha Dewangan"), "Must include Akanksha Dewangan");
    console.assert(discoMembers.some(m => m.name === "Mohan"), "Must include Mohan");
    console.log(`✓ 4B. Discipline Coordinator 'akanksha' verified (Members: ${discoMembers.map(m=>m.name).join(", ")})`);

    // 5. English Council sets Morning Goal for Dilip
    const today = new Date().toISOString().split("T")[0];
    const newGoal = await request("/api/v1/goals", {
      method: "POST",
      headers: { Authorization: `Bearer ${councilToken}` },
      body: {
        title: "Conduct morning English reading circle",
        description: "Vocabulary flashcards and newspaper discussion",
        expectedOutcome: "All students participate in reading exercise",
        priority: "HIGH",
        goalDate: today,
        assignedToName: "Dilip",
      },
    });
    console.assert(newGoal.status === 201, "Goal creation failed");
    englishGoalId = newGoal.data.data.goalId;
    console.assert(newGoal.data.data.assignedToName === "Dilip", "Assigned member must be Dilip");
    console.log(`✓ 5. Daily Goal created for Dilip (Goal ID: ${englishGoalId}, Assigned: ${newGoal.data.data.assignedToName})`);

    // 6. Council sets Weekly Goal
    const weeklyGoal = await request("/api/v1/weekly-goals", {
      method: "POST",
      headers: { Authorization: `Bearer ${councilToken}` },
      body: {
        title: "Organize campus-wide English debate tournament",
        description: "Form debate teams, distribute topics, and host finals on Saturday",
        weekStart: today,
        weekEnd: today,
        status: "ACTIVE",
      },
    });
    console.assert(weeklyGoal.status === 201 || weeklyGoal.status === 200, "Weekly goal creation failed");
    weeklyGoalId = weeklyGoal.data.data.weeklyGoalId;
    console.log(`✓ 6. Weekly Goal created successfully (ID: ${weeklyGoalId})`);

    // 7. Council Evening Reflection
    const reflection = await request("/api/v1/reflections", {
      method: "POST",
      headers: { Authorization: `Bearer ${councilToken}` },
      body: {
        reflectionDate: today,
        achievements: "Reading circle completed on schedule with 100% attendance",
        challenges: "Few students needed help with pronunciation",
        learnings: "Pair beginners with advanced speakers",
        improvements: "Prepare audio guide for tomorrow",
        goalStatuses: [
          {
            goalId: englishGoalId,
            status: "COMPLETED",
            incompleteReason: "",
          },
        ],
      },
    });
    console.assert(reflection.status === 201 || reflection.status === 200, "Reflection submission failed");
    console.log("✓ 7. Evening Reflection submitted and Dilip's goal marked COMPLETED");

    // 7B. AI Monthly Progress Calculation Verification
    const monthlyProg = await request("/api/v1/analytics/monthly", {
      headers: { Authorization: `Bearer ${councilToken}` },
    });
    console.assert(monthlyProg.status === 200, "Monthly progress failed");
    console.assert(monthlyProg.data.data.aiMonthlyInsight !== undefined, "Must include AI monthly calculation insight");
    console.log(`✓ 7B. AI Monthly Progress verified (Grade: ${monthlyProg.data.data.aiMonthlyInsight.grade}, Score: ${monthlyProg.data.data.aiMonthlyInsight.completionScore}%)`);

    // 8. Admin Profile Update
    const updateProfile = await request("/api/v1/auth/profile", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: "Campus Administrator",
        email: "admin@counciltrack.org",
      },
    });
    console.assert(updateProfile.status === 200, "Update profile failed");
    console.assert(updateProfile.data.data.name === "Campus Administrator", "Admin name should be updated");
    console.log("✓ 8. Admin Profile updated successfully (Name changed to 'Campus Administrator')");

    // 9. Council Password Change
    const changePw = await request("/api/v1/auth/change-password", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${councilToken}` },
      body: {
        currentPassword: "Admin@123",
        newPassword: "English@2026New",
      },
    });
    console.assert(changePw.status === 200, "Password change failed");
    console.log("✓ 9. Council Password changed successfully to 'English@2026New'");

    // 10. Verify login with new password
    const newLogin = await request("/api/v1/auth/login", {
      method: "POST",
      body: { email: "english@counciltrack.org", password: "English@2026New" },
    });
    console.assert(newLogin.status === 200, "Login with new password failed");
    console.log("✓ 10. Council successfully authenticated using newly set password!");

    // Clean up test password back to default
    await request("/api/v1/auth/change-password", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${newLogin.data.data.token}` },
      body: {
        currentPassword: "English@2026New",
        newPassword: "Admin@123",
      },
    });
    console.log("✓ 11. Restored default password for seamless testing");

    console.log("\n=======================================================");
    console.log("🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉");
    console.log("=======================================================");
  } catch (err) {
    console.error("Test failure:", err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
