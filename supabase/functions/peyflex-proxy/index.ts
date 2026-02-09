const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PEYFLEX_BASE = "https://client.peyflex.com.ng";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate token by calling Supabase auth
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: serviceKey },
    });
    if (!userRes.ok) {
      await userRes.text();
      return json({ error: "Unauthorized" }, 401);
    }
    await userRes.json();

    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const peyflexToken = Deno.env.get("PEYFLEX_API_TOKEN")!;
    const peyflexHeaders: Record<string, string> = {
      Authorization: `Token ${peyflexToken}`,
      "Content-Type": "application/json",
    };

    let result: unknown;

    switch (action) {
      case "data-networks": {
        const res = await fetch(`${PEYFLEX_BASE}/api/data/networks/`, {
          headers: peyflexHeaders,
        });
        result = await res.json();
        break;
      }

      case "data-plans": {
        const network = url.searchParams.get("network");
        if (!network) return json({ error: "network param required" }, 400);
        const res = await fetch(
          `${PEYFLEX_BASE}/api/data/plans/?network=${encodeURIComponent(network)}`,
          { headers: peyflexHeaders }
        );
        result = await res.json();
        break;
      }

      case "airtime-networks": {
        const res = await fetch(`${PEYFLEX_BASE}/api/airtime/networks/`, {
          headers: peyflexHeaders,
        });
        result = await res.json();
        break;
      }

      case "data-purchase": {
        if (req.method !== "POST") return json({ error: "POST required" }, 405);
        const body = await req.json();
        const { network, mobile_number, plan_code } = body;
        if (!network || !mobile_number || !plan_code) {
          return json({ error: "network, mobile_number, plan_code required" }, 400);
        }
        const res = await fetch(`${PEYFLEX_BASE}/api/data/purchase/`, {
          method: "POST",
          headers: peyflexHeaders,
          body: JSON.stringify({ network, mobile_number, plan_code }),
        });
        result = await res.json();
        break;
      }

      case "airtime-purchase": {
        if (req.method !== "POST") return json({ error: "POST required" }, 405);
        const body = await req.json();
        const { network, mobile_number, amount } = body;
        if (!network || !mobile_number || !amount) {
          return json({ error: "network, mobile_number, amount required" }, 400);
        }
        const res = await fetch(`${PEYFLEX_BASE}/api/airtime/purchase/`, {
          method: "POST",
          headers: peyflexHeaders,
          body: JSON.stringify({ network, mobile_number, amount }),
        });
        result = await res.json();
        break;
      }

      case "wallet": {
        const res = await fetch(`${PEYFLEX_BASE}/api/user/wallet/`, {
          headers: peyflexHeaders,
        });
        result = await res.json();
        break;
      }

      default:
        return json({ error: "Invalid action" }, 400);
    }

    return json(result);
  } catch (error) {
    return json({ error: (error as Error).message || "Internal error" }, 500);
  }
});
