import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { imageBase64, artifactNumber, title, origin, material, estimatedAge } = await req.json();

    if (!imageBase64) {
      throw new Error("imageBase64 is required");
    }

    const prompt = `You are a professional product photographer. Generate EXACTLY this composition every time with NO variation in layout:

EXACT LAYOUT SPECIFICATION (follow precisely):
- IMAGE FORMAT: Perfect 1:1 square, landscape orientation
- BACKGROUND: Dark charcoal gray gradient wall filling the top 65% of the image. Subtle concrete texture. No patterns, no decorations.
- FLOOR: Warm gray-beige stone floor (#B7ADA2) filling the bottom 35% of the image. Clean, flat, no visible seams.
- PRODUCT PLACEMENT: The product from the provided photo must be placed dead center horizontally, sitting naturally on the floor surface. The product should occupy roughly 40-50% of the image width and be vertically centered between floor and top of image.
- LIGHTING: Single soft spotlight from directly above the product. Gentle vignette darkening at all four edges. Subtle soft shadow directly beneath the product on the floor.
- MUSEUM PLACARD: A rectangular white/ivory card (approximately 20% of image width, 25% of image height) positioned in the BOTTOM-LEFT corner of the image, resting upright on the floor at a very slight angle. The card has a thin dark border.

PLACARD TEXT (must be perfectly legible, use bold black serif font on white/cream background):
  Line 1 (largest, bold): "Artifact #${artifactNumber}"
  Line 2: "${title}"
  Line 3: "Origin: ${origin}"
  Line 4: "Material: ${material}"
  Line 5: "Estimated Age: ${estimatedAge}"

CRITICAL RULES:
- Do NOT modify the product itself. Keep it exactly as provided.
- The layout must be IDENTICAL every time: wall on top, floor on bottom, product centered, placard bottom-left.
- Text on placard must be HIGH CONTRAST black on white, sharp and crisp, never blurry.
- No additional objects, decorations, or elements. Just wall, floor, product, shadow, spotlight, and placard.
- Photorealistic museum exhibit photograph style.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      throw new Error("No image was generated");
    }

    return new Response(
      JSON.stringify({ imageUrl: generatedImageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-museum-image error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
