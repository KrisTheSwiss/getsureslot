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

    const { staffId, clientEmail, startTime, selectedDate, selectedTime } = await req.json();

    if (!staffId || !clientEmail || !startTime) {
      return new Response(
        JSON.stringify({ error: "staffId, clientEmail, and startTime are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get staff + salon info
    const { data: staff, error: staffErr } = await supabase
      .from("staff")
      .select("*, salons(name)")
      .eq("id", staffId)
      .single();

    if (staffErr || !staff) {
      return new Response(
        JSON.stringify({ error: "Staff not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const depositCents = staff.deposit_amount_cents;
    const salonName = (staff as any).salons?.name || "Studio";

    // Create the booking first to get the reference number
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .insert({
        staff_id: staffId,
        client_email: clientEmail,
        start_time: startTime,
        status: "pending",
      })
      .select("id, reference_number")
      .single();

    if (bookingErr || !booking) {
      return new Response(
        JSON.stringify({ error: "Failed to create booking", details: bookingErr?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const refNumber = booking.reference_number || "BOOKING";
    const origin = req.headers.get("origin") || "https://getsureslot.lovable.app";

    // Build Checkout session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: depositCents,
            product_data: {
              name: `Deposit — ${staff.name} at ${salonName}`,
              description: refNumber,
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        description: refNumber,
        metadata: {
          booking_id: booking.id,
          reference_number: refNumber,
          staff_id: staffId,
        },
      },
      metadata: {
        booking_id: booking.id,
        reference_number: refNumber,
      },
      success_url: `${origin}/booking-success?ref=${refNumber}`,
      cancel_url: `${origin}/book/${staffId}?cancelled=true`,
    };

    // If artist has a connected Stripe account, use direct charges
    if (staff.stripe_account_id) {
      sessionParams.payment_intent_data!.transfer_data = {
        destination: staff.stripe_account_id,
      };
      // Platform keeps $10 (1000 cents) as application fee
      sessionParams.payment_intent_data!.application_fee_amount = 1000;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({
        url: session.url,
        bookingId: booking.id,
        referenceNumber: refNumber,
      }),
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
