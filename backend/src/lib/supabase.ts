import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const options: Record<string, any> = {};

// Node < 22 no tiene WebSocket nativo
if (typeof globalThis.WebSocket === "undefined") {
    try {
        const ws = require("ws");
        options.realtime = { transport: ws };
    } catch {}
}

export const supabase = createClient(supabaseUrl, supabaseKey, options);
