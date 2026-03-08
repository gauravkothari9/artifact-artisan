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
- MUSEUM PLACARD — MANDATORY FIXED TEMPLATE. ZERO VARIATION ALLOWED. MUST BE IDENTICAL IN EVERY IMAGE REGARDLESS OF ASPECT RATIO (1:1 OR 3:2):
  * THIS IS THE SINGLE MOST IMPORTANT ELEMENT TO GET RIGHT. The placard must look EXACTLY THE SAME in both 1:1 and 3:2 images — same physical size on screen, same style, same colors, same font, same position relative to bottom-left corner.
  * POSITION — FIXED, NEVER CHANGES BETWEEN 1:1 AND 3:2:
    - The placard is ALWAYS in the BOTTOM-LEFT corner.
    - Left edge of placard = exactly 3% from the LEFT edge of the image (in both square and landscape).
    - Bottom edge of placard = exactly 2% from the BOTTOM edge of the image (in both square and landscape).
    - In landscape (3:2), the left edge is still 3% from the left — do NOT move it to the center or further right.
    - The placard sits on the floor, leaning against the wall. NEVER floating, NEVER centered, NEVER on the right side.
    - Z-ORDER / LAYERING: The placard is ALWAYS rendered IN FRONT of the product and all other elements. It must NEVER be occluded, hidden, or partially covered by the product. The placard is the TOP-MOST layer in the scene.
  * SIZE & SHAPE RATIO: The placard card itself MUST have a 3:2 aspect ratio (wider than tall). Width = exactly 10% of image WIDTH. Height = width × (2/3). The placard is ALWAYS landscape-oriented (wider than tall). In landscape images, keep the SAME pixel size as in square — do NOT shrink it.
  * SHAPE & REALISM: The placard must look like a REAL PHYSICAL museum placard photographed in the scene. It should have realistic 3D perspective — slightly angled as if it's a small card sitting on the floor and leaning against the wall at a slight angle. It should look like a real object in the space, NOT a flat 2D overlay pasted on top. Add a subtle natural shadow beneath/behind the placard. The card should have slight depth and realistic lighting matching the scene. Sharp 90-degree corners, NO rounded corners, NO curling.
  * TEXT STYLING (CRITICAL — MUST BE EXACTLY THE SAME EVERY TIME, ZERO VARIATION):
    - Font: Classic serif font (Times New Roman style)
    - ONLY Line 1 is BOLD. Lines 2 through 6 are REGULAR/NORMAL weight — they must NOT be bold.
    - Color: Pure black #000000 text on solid pure white #FFFFFF background
    - ALL text is SHARP, CRISP, and FULLY READABLE. NO blurring, NO fuzzy text.
    - Text alignment: LEFT-aligned with generous internal padding
    - Border: Thin 1px solid #333333 on all 4 sides
    - This exact styling must be IDENTICAL in every generated image. NEVER make lines 2-6 bold.
  * TEXT CONTENT (exactly 6 lines, top to bottom):
    - Line 1 (BOLD, largest font size): Artifact No. ${artifactNumber}
    - Line 2 (NORMAL weight, smaller font): ${title}
    - Line 3 (NORMAL weight, smaller font): Origin: ${origin}
    - Line 4 (NORMAL weight, smaller font): Material: ${material}
    - Line 5 (NORMAL weight, smaller font): Size: ${size}
    - Line 6 (NORMAL weight, smaller font): Est. Age: ${estimatedAge}
    RULE: ONLY Line 1 is bold. Lines 2-6 must be regular/normal weight. Do NOT include any formatting instructions or style descriptors as visible text.
  * ABSOLUTE CONSISTENCY: The placard in a 3:2 landscape image must be VISUALLY IDENTICAL to the placard in a 1:1 square image — same card size on screen, same font size, same style, same colors. The ONLY difference is that in landscape there is more background space to the right. The placard itself NEVER changes.
` : `
- ABSOLUTELY NO PLACARD: Do NOT include any text card, label, placard, caption, or any form of text overlay anywhere in the image. The scene must contain ONLY the product, the wall, and the floor. Nothing else. ZERO text elements anywhere.
`;

    const prompt = `Place the product from the input photo into a museum gallery scene. The result must look like a real DSLR photograph.

PRODUCT: Keep the product EXACTLY as it appears in the input — same angle, colors, size, lighting. Do not redraw or modify the product in any way. Composite it into the scene.

BACKGROUND — THIS IS CRITICAL, READ CAREFULLY:
- WALL (top 65% of image): DARK CHARCOAL GRAY wall. The wall must be DARK — color hex #4A4A4E to #55555A. Think very dark gray, almost approaching black but not quite. It is NOT light gray, NOT white, NOT medium gray. It must be DARK. Smooth matte plaster finish with subtle gradient (darker at top, very slightly lighter near floor).
- FLOOR (bottom 35% of image): WARM BROWN EMPERADOR MARBLE. The floor must be WARM-TONED — base color hex #C4B5A4 (warm beige-tan-brown). It must have PROMINENT dark brown veining streaks throughout in organic patterns. The marble must be HIGHLY POLISHED with a glossy reflective sheen. It must NOT be white marble, NOT gray marble, NOT Carrara marble. Think rich warm brown Italian Emperador marble with visible dark veining.
- The wall-to-floor transition is a clean horizontal line at ~65% from top. No baseboards.

ABSOLUTE COLOR REQUIREMENTS (DO NOT DEVIATE):
- Wall = DARK (like charcoal/dark slate) — if the wall looks light or white, you have FAILED
- Floor = WARM BROWN with dark veining — if the floor looks white or cool gray, you have FAILED

LIGHTING: Soft warm overhead museum lighting. Product casts a natural soft shadow on the floor. The polished marble shows subtle reflection of the product base.

LAYOUT:
- ${aspectRatio === '3:2' ? 'Landscape 3:2 ratio (1536x1024)' : 'Square 1:1 ratio (1024x1024)'}
- Product centered on the floor, grounded naturally

${placardSection}

CHECKLIST: Dark charcoal wall ✓ Warm brown marble floor with veining ✓ Product unchanged ✓ Realistic photograph ✓`;

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
        ...(aspectRatio === '1:1' ? { image_size: "1024x1024" } : { image_size: "1536x1024" }),
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
