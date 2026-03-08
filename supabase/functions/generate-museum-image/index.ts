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
- MUSEUM PLACARD — MANDATORY FIXED TEMPLATE. ZERO VARIATION ALLOWED. EVERY IMAGE MUST USE THIS IDENTICAL DESIGN:
  * THIS IS THE SINGLE MOST IMPORTANT ELEMENT TO GET RIGHT. If the placard varies in ANY way between images, the entire output is REJECTED and WORTHLESS.
  * POSITION: ALWAYS bottom-left corner. The placard's left edge is exactly 3% from the image's left edge. The placard's bottom edge is exactly 2% from the image's bottom edge. It sits on the floor, leaning against the wall. NEVER place it anywhere else — not center, not right, not floating, not on the wall.
  * SIZE: The placard is a SMALL card. It must be EXACTLY 8% of the total image width and EXACTLY 12% of the total image height. This means in a 1024x1024 image it would be roughly 82x123 pixels. In a 1200x800 image it would be roughly 96x96 pixels. It is a TINY card — much smaller than the product. If the placard appears large or medium-sized, you have made it WRONG. It should look like a small museum label card, not a poster.
  * SHAPE: Flat rectangle. Sharp 90-degree corners. NO rounded corners. NO 3D perspective. NO curling. NO shadow cast by the card. Slight 2-degree clockwise tilt.
  * APPEARANCE (NEVER CHANGE THIS):
    - Background: Solid pure white #FFFFFF — not cream, not off-white
    - Border: Thin 1px solid #333333 on all 4 sides
    - All text: Pure black #000000, classic serif font (like Times New Roman)
    - Text is left-aligned with small internal padding
  * TEXT CONTENT (6 lines, top to bottom):
    - Line 1 (bold, title size): "Artifact No. ${artifactNumber}" — Use the text "No." (capital N, lowercase o, period) followed by a space and then the number. Make sure this text is CRISP, SHARP, and fully LEGIBLE. Every character must be clearly readable.
    - Line 2 (regular): "${title}"
    - Line 3 (smaller): "Origin: ${origin}"
    - Line 4 (smaller): "Material: ${material}"
    - Line 5 (smaller): "Size: ${size}"
    - Line 6 (smaller): "Est. Age: ${estimatedAge}"
  * CONSISTENCY RULE: Compare this placard mentally to every other placard you have ever generated for this prompt. They must ALL look IDENTICAL — same size, same position, same font, same colors, same border, same style. If you notice ANY difference, correct it to match this template EXACTLY.
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
- IMAGE FORMAT: ${aspectRatio === '3:2' ? 'Landscape 3:2 aspect ratio (e.g. 1200x800 pixels). Wider than tall. CRITICAL: The extra width is filled ONLY by extending the wall and floor background. The product stays the EXACT same size and appearance as it would in a 1:1 image. Do NOT stretch, resize, reinterpret, re-render, or alter the product in ANY way to "fill" the wider canvas. The product simply has more empty wall/floor space on its left and right sides.' : 'Perfect 1:1 square (e.g. 1024x1024 pixels).'}
- WALL: Top 65% of image. FLAT dark charcoal gradient #3A3A3A (top) to #4A4A4A (bottom). Very subtle fine concrete/plaster texture. NOT brick, NOT wood, NOT stucco.
- FLOOR: Bottom 35% of image. FLAT warm gray-beige stone #B7ADA2. Smooth, matte. NOT marble, NOT wood, NOT tile.
- Wall-to-floor transition: Clean straight horizontal line at exactly 65% from top. No baseboards, no moldings.
- PRODUCT PLACEMENT: Place the UNMODIFIED, UNSIZED, UNALTERED product dead center horizontally, sitting naturally on floor. The product must be a DIRECT CUTOUT from the original — identical pixels, identical size, identical colors, identical lighting. In landscape mode, do NOT re-render or re-imagine the product; just place the same exact product with more background space around it.

${placardSection}

FINAL CHECKLIST (ALL MUST BE TRUE OR IMAGE IS REJECTED):
1. Product is PIXEL-IDENTICAL to input — same size, same colors, same lighting, NO modifications whatsoever.
2. Product size is UNCHANGED — not shrunk, not enlarged, not rescaled.
3. Lighting is FLAT and EVEN everywhere — ZERO spotlights, ZERO directional lights, ZERO light cones or beams.
4. Wall is #3A3A3A-#4A4A4A, floor is #B7ADA2 — uniform colors, NO lighting variation.
5. ${showPlacard ? 'Placard is a SMALL card (8% width, 12% height), bottom-left corner (3% from left, 2% from bottom), white #FFFFFF background, thin #333333 border, black serif text. It must look IDENTICAL in every single generated image — same tiny size, same position, same style. NEVER make it bigger or move it.' : 'NO text, labels, or placards anywhere.'}
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
