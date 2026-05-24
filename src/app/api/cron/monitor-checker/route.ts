import { NextResponse } from "next/server";
import { createClient } from "@insforge/sdk";

// Use the Next.js Edge Runtime
export const runtime = "edge";

export async function POST(req: Request) {
  // Verify authorization if needed (e.g. cron secret)
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Create client using the SERVICE_ROLE_KEY to bypass RLS for background jobs
  const client = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || "",
    anonKey: process.env.INSFORGE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
  });

  try {
    // 1. Fetch active monitors
    const { data: monitors, error: monitorError } = await client.database
      .from("monitors")
      .select("*")
      .eq("is_active", true);

    if (monitorError) throw monitorError;
    if (!monitors || monitors.length === 0) {
      return NextResponse.json({ success: true, message: "No active monitors to check" });
    }

    const checkResults = await Promise.allSettled(
      monitors.map(async (monitor: any) => {
        const startTime = Date.now();
        let status = "down";
        let statusCode = 0;
        let errorMessage = null;
        let responseTime = 0;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), monitor.timeout_ms || 30000);

          const response = await fetch(monitor.url, {
            method: monitor.method || "GET",
            headers: monitor.headers || {},
            body: ["POST", "PUT", "PATCH"].includes(monitor.method) && monitor.body ? monitor.body : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          responseTime = Date.now() - startTime;
          statusCode = response.status;
          
          if (statusCode === (monitor.expected_status || 200)) {
            status = "up";
          } else {
            status = "down";
            errorMessage = `Expected status ${monitor.expected_status || 200}, got ${statusCode}`;
          }
        } catch (error: any) {
          responseTime = Date.now() - startTime;
          if (error.name === "AbortError") {
            errorMessage = `Timeout after ${monitor.timeout_ms}ms`;
          } else {
            errorMessage = error.message || "Failed to connect";
          }
        }

        // 2. Insert monitor check record
        await client.database.from("monitor_checks").insert({
          monitor_id: monitor.id,
          status,
          response_time_ms: responseTime,
          status_code: statusCode,
          error_message: errorMessage,
        });

        // 3. Handle incident logic if status changed
        if (monitor.current_status !== status && monitor.current_status !== null) {
          // Status changed! Create an incident
          const { data: newIncident } = await client.database.from("incidents").insert({
            monitor_id: monitor.id,
            tenant_id: monitor.tenant_id,
            status: status === "down" ? "investigating" : "resolved",
            severity: status === "down" ? "critical" : "none",
            title: `Monitor ${monitor.name} is ${status.toUpperCase()}`,
            description: errorMessage || `Monitor status changed to ${status}`,
            started_at: new Date().toISOString(),
            resolved_at: status === "up" ? new Date().toISOString() : null,
          }).select().single();

          if (newIncident) {
            // Log incident event
            await client.database.from("incident_events").insert({
              incident_id: newIncident.id,
              status: newIncident.status,
              message: `System detected status change: ${status}`,
            });
            
            // Create a notification for the tenant
            await client.database.from("notifications").insert({
              tenant_id: monitor.tenant_id,
              type: "alert",
              title: newIncident.title,
              message: newIncident.description,
              data: { monitor_id: monitor.id, incident_id: newIncident.id }
            });
          }
        }

        // 4. Update the monitor's current status
        await client.database.from("monitors").update({
          current_status: status,
          last_checked_at: new Date().toISOString(),
          last_response_time: responseTime,
        }).eq("id", monitor.id);

        return { monitorId: monitor.id, status, responseTime };
      })
    );

    const results = checkResults.map((r: any) => r.status === "fulfilled" ? r.value : { error: r.reason });

    return NextResponse.json({ success: true, checksRun: monitors.length, results });
  } catch (error: any) {
    console.error("Function error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Support GET requests for easy local testing via browser
export async function GET(req: Request) {
  return POST(req);
}
