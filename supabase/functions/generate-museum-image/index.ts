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

    const { imageBase64, artifactNumber, title, origin, material, estimatedAge, size, showPlacard = true } = await req.json();

    if (!imageBase64) {
      throw new Error("imageBase64 is required");
    }

    const placardSection = showPlacard ? `
- MUSEUM PLACARD: A very small rectangular white/ivory card (approximately 8% of image width, 12% of image height) positioned in the BOTTOM-LEFT corner of the image, resting upright on the floor at a very slight angle. The card has a thin dark border.

PLACARD TEXT (must be perfectly legible, use bold black serif font on white/cream background):
  Line 1 (largest, bold): "Artifact #${artifactNumber}"
  Line 2: "${title}"
  Line 3: "Origin: ${origin}"
  Line 4: "Material: ${material}"
  Line 5: "Size: ${size}"
  Line 6: "Estimated Age: ${estimatedAge}"
` : `
- ABSOLUTELY NO PLACARD: Do NOT include any text card, label, placard, caption, or any form of text overlay anywhere in the image. The scene must contain ONLY the product, the wall, and the floor. Nothing else.
`;

    const prompt = `You are a professional product photographer creating a museum exhibit photo. Your #1 priority is to PRESERVE THE PRODUCT EXACTLY AS IT APPEARS in the provided photo. Do NOT alter, modify, reshape, recolor, or artistically reinterpret the product in any way. The product must look IDENTICAL to the input photo — same shape, same colors, same textures, same details, same proportions.

EXACT LAYOUT SPECIFICATION (follow precisely):
- IMAGE FORMAT: Perfect 1:1 square
- BACKGROUND: Dark charcoal gray gradient wall filling the top 65% of the image. Subtle concrete texture. No patterns, no decorations.
- FLOOR: Warm gray-beige stone floor (#B7ADA2) filling the bottom 35% of the image. Clean, flat, no visible seams.
- PRODUCT PLACEMENT: Place the UNMODIFIED product from the provided photo dead center horizontally, sitting naturally on the floor surface. The product should occupy roughly 40-50% of the image width and be vertically centered between floor and top of image.
- LIGHTING: Single soft spotlight from directly above the product. Gentle vignette darkening at all four edges. Subtle soft shadow directly beneath the product on the floor.
${placardSection}
CRITICAL RULES (MUST FOLLOW ALL):
1. NEVER modify, alter, or reinterpret the product. It must be a pixel-accurate representation of the input photo, just placed in the museum scene.
2. The layout must be IDENTICAL every time: wall on top, floor on bottom, product centered.
3. ${showPlacard ? 'Include a small placard in the bottom-left. Text must be HIGH CONTRAST black on white, sharp and crisp, never blurry.' : 'ABSOLUTELY NO text, labels, placards, or any writing anywhere in the image. Zero text elements.'}
4. No additional objects, decorations, or elements beyond the product, wall, floor${showPlacard ? ', and placard' : ''}.
5. Photorealistic museum exhibit photograph style.
6. The product's appearance is SACRED — do not change it.`;

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
