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
        let isUp = false;
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
            isUp = true;
          } else {
            isUp = false;
            errorMessage = `Expected status ${monitor.expected_status || 200}, got ${statusCode}`;
          }
        } catch (error: any) {
          responseTime = Date.now() - startTime;
          if (error.name === "AbortError") {
            errorMessage = `Timeout after ${monitor.timeout_ms || 30000}ms`;
          } else {
            errorMessage = error.message || "Failed to connect";
          }
        }

        const newStatus = isUp ? "up" : "down";

        // 2. Insert monitor check record (matching actual DB schema)
        await client.database.from("monitor_checks").insert({
          monitor_id: monitor.id,
          is_up: isUp,
          response_time_ms: responseTime,
          status_code: statusCode || null,
          error_message: errorMessage,
          region: "edge-global",
        });

        // 3. Handle incident logic if status changed
        if (monitor.current_status !== newStatus && monitor.current_status !== null) {
          if (newStatus === "down") {
            // Going DOWN: create new incident
            const { data: newIncident } = await client.database.from("incidents").insert({
              monitor_id: monitor.id,
              tenant_id: monitor.tenant_id,
              status: "ongoing",
              severity: "critical",
              started_at: new Date().toISOString(),
              consecutive_failures: 1,
            }).select().single();

            if (newIncident) {
              await client.database.from("incident_events").insert({
                incident_id: newIncident.id,
                event_type: "detected",
                message: errorMessage || `Monitor ${monitor.name} is DOWN`,
              });

              await client.database.from("notifications").insert({
                tenant_id: monitor.tenant_id,
                user_id: monitor.created_by,
                monitor_id: monitor.id,
                incident_id: newIncident.id,
                type: "downtime",
                title: `🔴 ${monitor.name} is DOWN`,
                message: errorMessage || `Expected status ${monitor.expected_status || 200}`,
                is_read: false,
                channel: "in_app",
              });
            }
          } else {
            // Going UP: resolve existing incidents
            const { data: openIncidents } = await client.database
              .from("incidents")
              .select("id, started_at")
              .eq("monitor_id", monitor.id)
              .eq("status", "ongoing");

            if (openIncidents && openIncidents.length > 0) {
              for (const incident of openIncidents) {
                const durationMs = new Date().getTime() - new Date(incident.started_at).getTime();
                const durationSec = Math.round(durationMs / 1000);

                await client.database.from("incidents").update({
                  status: "resolved",
                  resolved_at: new Date().toISOString(),
                  duration_seconds: durationSec,
                }).eq("id", incident.id);

                await client.database.from("incident_events").insert({
                  incident_id: incident.id,
                  event_type: "resolved",
                  message: `Monitor ${monitor.name} is back UP (resolved after ${durationSec}s)`,
                });
              }

              await client.database.from("notifications").insert({
                tenant_id: monitor.tenant_id,
                user_id: monitor.created_by,
                monitor_id: monitor.id,
                type: "recovery",
                title: `🟢 ${monitor.name} is back UP`,
                message: `Recovered with ${responseTime}ms response time`,
                is_read: false,
                channel: "in_app",
              });
            }
          }
        }

        // 4. Update the monitor's current status
        const updatePayload: Record<string, any> = {
          current_status: newStatus,
          last_checked_at: new Date().toISOString(),
          last_response_time: responseTime,
        };

        if (newStatus === "down") {
          updatePayload.consecutive_failures = (monitor.consecutive_failures || 0) + 1;
        } else {
          updatePayload.consecutive_failures = 0;
        }

        await client.database.from("monitors").update(updatePayload).eq("id", monitor.id);

        return { monitorId: monitor.id, name: monitor.name, status: newStatus, responseTime };
      })
    );

    const results = checkResults.map((r: any) => r.status === "fulfilled" ? r.value : { error: r.reason?.message });

    return NextResponse.json({ success: true, checksRun: monitors.length, results });
  } catch (error: any) {
    console.error("Monitor checker error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Support GET requests for easy local testing via browser
export async function GET(req: Request) {
  return POST(req);
}
