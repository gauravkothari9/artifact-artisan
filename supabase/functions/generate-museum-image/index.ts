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

    const { imageBase64, artifactNumber, title, origin, material, estimatedAge, size, showPlacard = true, aspectRatio = '1:1' } = await req.json();

    if (!imageBase64) {
      throw new Error("imageBase64 is required");
    }

    const placardSection = showPlacard ? `
- MUSEUM PLACARD — THIS IS A RIGID TEMPLATE. COPY EXACTLY. NO CREATIVITY ALLOWED:
  * POSITION: Bottom-left corner. Left edge = 3% from image left. Bottom edge = 2% from image bottom. Flush against wall, sitting on floor. NEVER center, NEVER right, NEVER floating, NEVER on wall. BOTTOM-LEFT ONLY.
  * SIZE: Width = EXACTLY 8% of image width. Height = EXACTLY 12% of image height. NOT 10%, NOT 15%, NOT 20%. EXACTLY 8% wide and 12% tall. If you make it any other size, the image is REJECTED.
  * SHAPE: Perfectly flat rectangle. SHARP 90-degree corners. NO rounded corners. NO folding. NO 3D perspective. NO shadow on card. Slight 2-degree clockwise tilt.
  * CARD BACKGROUND: Solid pure white (#FFFFFF). NO cream, NO off-white, NO gray. Pure #FFFFFF.
  * CARD BORDER: 1px solid dark gray (#333333) on ALL four sides. NO thicker borders. NO colored borders.
  * TEXT COLOR: ALL text is pure BLACK (#000000). NO gray text. NO colored text.
  * FONT: Classic serif font (Times New Roman style). NO sans-serif. NO modern fonts. NO handwriting.
  * ALIGNMENT: Left-aligned with 8% internal padding on all sides.
  * TEXT LAYOUT (top to bottom, evenly spaced):
    - Line 1 (bold, largest): "Artifact #${artifactNumber}"
    - Line 2 (regular): "${title}"
    - Line 3 (regular, smaller): "Origin: ${origin}"
    - Line 4 (regular, smaller): "Material: ${material}"
    - Line 5 (regular, smaller): "Size: ${size}"
    - Line 6 (regular, smaller): "Est. Age: ${estimatedAge}"
  * ABSOLUTE NON-NEGOTIABLE RULE: The placard MUST be 8% width, 12% height, bottom-left at 3%/2% margins, white card, black border, black serif text. THIS IS A FIXED TEMPLATE — NEVER VARY IT. Every single generated image must have the IDENTICAL placard design. If you change ANYTHING about the placard design, position, or size, the output is WRONG.
` : `
- ABSOLUTELY NO PLACARD: Do NOT include any text card, label, placard, caption, or any form of text overlay anywhere in the image. The scene must contain ONLY the product, the wall, and the floor. Nothing else. ZERO text elements anywhere.
`;

    const prompt = `You are a professional product photographer creating a museum exhibit photo.

RULE #1 — PRODUCT PRESERVATION (HIGHEST PRIORITY):
The product in the provided photo is SACRED and UNTOUCHABLE.
- PRESERVE the product EXACTLY as it appears: same shape, same colors, same textures, same details, same proportions.
- PRESERVE the product SIZE: The product must occupy the SAME relative area in the output as it does in the input. Do NOT shrink it. Do NOT enlarge it. Do NOT rescale it. Keep the EXACT original dimensions and proportions of the product.
- Do NOT add ANY spotlight, glow, shine, reflection, highlight, rim light, or ANY additional lighting effect on or around the product.
- Do NOT darken, brighten, add contrast, color-shift, or alter the product's appearance in ANY way.
- The product must look like a DIRECT CUTOUT from the original photo placed into the scene — as if you used scissors to cut it out and glued it onto the background. ZERO modifications.
- If the output product looks different from the input product in ANY way (size, color, lighting, texture), the image is REJECTED.

RULE #2 — LIGHTING (MANDATORY):
- The ENTIRE scene uses ONLY flat, ambient, even, diffused lighting. ZERO directional light sources.
- There is NO spotlight. NO light beam. NO light cone. NO bright spot. NO dramatic lighting. NO rim lighting.
- The wall color stays uniform #3A3A3A-#4A4A4A. The floor color stays uniform #B7ADA2. NO lighting variation on surfaces.
- The ONLY shadow allowed: a very subtle, soft shadow directly beneath the product on the floor.

RULE #3 — LAYOUT:
- IMAGE FORMAT: ${aspectRatio === '3:2' ? 'Landscape 3:2 aspect ratio (e.g. 1200x800 pixels). Wider than tall.' : 'Perfect 1:1 square (e.g. 1024x1024 pixels).'}
- WALL: Top 65% of image. FLAT dark charcoal gradient #3A3A3A (top) to #4A4A4A (bottom). Very subtle fine concrete/plaster texture. NOT brick, NOT wood, NOT stucco.
- FLOOR: Bottom 35% of image. FLAT warm gray-beige stone #B7ADA2. Smooth, matte. NOT marble, NOT wood, NOT tile.
- Wall-to-floor transition: Clean straight horizontal line at exactly 65% from top. No baseboards, no moldings.
- PRODUCT PLACEMENT: Place the UNMODIFIED, UNSIZED product dead center horizontally, sitting naturally on floor.

${placardSection}

FINAL CHECKLIST (ALL MUST BE TRUE OR IMAGE IS REJECTED):
1. Product is PIXEL-IDENTICAL to input — same size, same colors, same lighting, NO modifications whatsoever.
2. Product size is UNCHANGED — not shrunk, not enlarged, not rescaled.
3. Lighting is FLAT and EVEN everywhere — ZERO spotlights, ZERO directional lights, ZERO light cones or beams.
4. Wall is #3A3A3A-#4A4A4A, floor is #B7ADA2 — uniform colors, NO lighting variation.
5. ${showPlacard ? 'Placard is EXACTLY 8% width, 12% height, bottom-left at 3%/2% margins, white (#FFFFFF) card, 1px #333333 border, black serif text. IDENTICAL template every single time — NEVER vary design, size, position, or style.' : 'NO text, labels, or placards anywhere.'}
6. No additional objects, decorations, or elements beyond product, wall, floor${showPlacard ? ', and placard' : ''}.
7. Photorealistic museum exhibit photograph style.`;

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
