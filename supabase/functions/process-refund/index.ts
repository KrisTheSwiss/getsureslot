import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORM_FEE_CENTS = 1000; // $10

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

    const { bookingId } = await req.json();

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: "bookingId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch booking with staff info
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("*, staff(deposit_amount_cents)")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (booking.status === "cancelled") {
      return new Response(
        JSON.stringify({ error: "Booking already cancelled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check 24-hour policy
    const hoursUntil = (new Date(booking.start_time).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntil <= 24) {
      return new Response(
        JSON.stringify({ error: "Non-refundable: less than 24 hours before appointment" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let refundProcessed = false;

    // If there's a Stripe payment intent, process the refund
    if (booking.stripe_payment_intent_id) {
      const depositCents = (booking as any).staff?.deposit_amount_cents || 0;
      const refundAmount = Math.max(0, depositCents - PLATFORM_FEE_CENTS);

      if (refundAmount > 0) {
        await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
          amount: refundAmount,
        });
        refundProcessed = true;
      }
    }

    // Update booking status
    await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    return new Response(
      JSON.stringify({ success: true, refundProcessed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
