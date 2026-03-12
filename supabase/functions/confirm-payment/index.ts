import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { referenceNumber } = await req.json();

    if (!referenceNumber) {
      return new Response(
        JSON.stringify({ error: "referenceNumber is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get booking
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, reference_number, status, stripe_payment_intent_id")
      .eq("reference_number", referenceNumber)
      .single();

    if (!booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the checkout session by metadata
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
    });

    let paymentIntentId: string | null = null;

    for (const session of sessions.data) {
      if (session.metadata?.reference_number === referenceNumber && session.payment_status === "paid") {
        paymentIntentId = session.payment_intent as string;
        break;
      }
    }

    if (paymentIntentId && booking.status === "pending") {
      await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          stripe_payment_intent_id: paymentIntentId,
        })
        .eq("id", booking.id);

      return new Response(
        JSON.stringify({ confirmed: true, referenceNumber }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ confirmed: false, status: booking.status }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
