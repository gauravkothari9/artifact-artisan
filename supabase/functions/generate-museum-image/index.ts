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
MUSEUM PLACARD — CRITICAL ELEMENT, MUST BE PERFECT:

VISIBILITY & Z-ORDER (HIGHEST PRIORITY):
- The placard MUST be clearly visible, fully readable, and NEVER obscured by the product or any other element.
- The placard is the TOP-MOST LAYER — it renders IN FRONT of everything else. If the product and placard overlap, the placard is ALWAYS on top.
- The placard must be LARGE ENOUGH to read all text clearly. Width = 15% of image width (larger than before for readability).

POSITION:
- Bottom-left corner of the image.
- Left edge = 3% from left edge of image. Bottom edge = 3% from bottom edge of image.
- The placard sits on the floor, leaning slightly against an invisible support. It faces the camera directly.
- NEVER floating, NEVER centered, NEVER on the right side.

SIZE & SHAPE:
- 3:2 aspect ratio (wider than tall). Width = 15% of image width. Height = width × (2/3).
- Landscape-oriented. Same physical size in both 1:1 and 3:2 images.

APPEARANCE:
- A FLAT, CLEAN white card (#FFFFFF background) with a thin dark border (#333333, 1px).
- Sharp 90-degree corners. NO rounded corners.
- The card should look like a real physical museum label card — clean, crisp, professional.
- Subtle small shadow beneath the card to ground it on the floor.

TEXT (MUST BE SHARP, CRISP, AND FULLY READABLE — this is critical):
- Font: Classic serif (Times New Roman style). Pure black (#000000) text.
- ALL text must be SHARP and CRISP — no blurring, no fuzziness, no artifacts. Every letter must be clearly legible.
- Text is LEFT-aligned with generous padding inside the card.
- Line 1 (BOLD, largest size): Artifact No. ${artifactNumber}
- Line 2 (normal weight, smaller): ${title}
- Line 3 (normal weight, smaller): Origin: ${origin}
- Line 4 (normal weight, smaller): Material: ${material}
- Line 5 (normal weight, smaller): Size: ${size}
- Line 6 (normal weight, smaller): Est. Age: ${estimatedAge}
- ONLY Line 1 is bold. Lines 2-6 are regular weight.
- Do NOT include formatting instructions as visible text.

CONSISTENCY: The placard must look identical in every generated image — same size, style, font, colors, position.
` : `
- ABSOLUTELY NO PLACARD: Do NOT include any text card, label, placard, caption, or any form of text overlay anywhere in the image. The scene must contain ONLY the product, the wall, and the floor. Nothing else. ZERO text elements anywhere.
`;

    const prompt = `You are compositing a product photograph into a museum gallery scene. This is a PHOTO COMPOSITING task, NOT an image generation task.

######## CRITICAL — PRODUCT PRESERVATION (READ THIS FIRST) ########

THE PRODUCT MUST REMAIN 100% UNCHANGED. THIS IS NON-NEGOTIABLE.

You are NOT generating a new image of the product. You are EXTRACTING the product from the input photograph and PLACING it onto a museum background. The product pixels must be IDENTICAL to the input.

FORBIDDEN — DO NOT DO ANY OF THESE TO THE PRODUCT:
- DO NOT redraw, regenerate, re-render, or re-imagine the product
- DO NOT change the product's shape, silhouette, proportions, or form
- DO NOT modify colors, hues, saturation, brightness, or contrast
- DO NOT alter textures, patterns, surface details, or materials
- DO NOT add or remove any lighting, shadows, highlights, or reflections ON the product
- DO NOT change the product's angle, orientation, pose, or perspective
- DO NOT simplify, stylize, smooth, sharpen, blur, or "improve" the product
- DO NOT interpret what the product "should" look like — use EXACTLY what is shown
- DO NOT fill in, complete, or modify any part of the product

REQUIRED — WHAT YOU MUST DO:
- Extract/cut out the product EXACTLY as it appears in the input image
- Paste the product onto the museum background with ZERO modifications
- The product should look like it was photographed in the museum, not generated

Think of this as Photoshop compositing: Select → Cut → Paste. The product pixels are sacred and untouchable.

######## END PRODUCT PRESERVATION RULES ########

ENVIRONMENT — DARK GALLERY WITH WARM MARBLE FLOOR:

WALL (upper ~65% of frame):
- Color: Dark charcoal gray (#4A4A4E to #55555A). NOT light, NOT medium gray — truly DARK.
- Surface: Smooth matte plaster with a velvety, slightly chalky texture visible at close inspection.
- Gradient: Very subtle — fractionally darker at top, fractionally lighter approaching the floor.
- The wall extends edge-to-edge. No ceiling line, no fixtures, no track lights, no rails, no moldings.

FLOOR (lower ~35% of frame):
- Material: Polished light-toned marble — light warm beige/cream base (#D9CFC2 to #E5DDD2) with subtle soft warm veining.
- The marble is LIGHT and WARM-TONED: light beige, cream, ivory, light tan. NOT dark brown, NOT dark marble.
- Surface: Highly polished with a glossy sheen. Soft reflections of the product's base visible on the floor.
- Veining: Subtle, low-contrast — soft warm tan/light brown veins blending gently into the light base.

WALL-FLOOR JUNCTION:
- A clean, sharp horizontal line at approximately 65% from the top. No baseboard, no molding.
- Very subtle ambient occlusion darkening right at the junction.

LIGHTING & ATMOSPHERE:
- Soft, warm, diffused ambient light from hidden overhead sources (~3200K).
- The product casts a realistic soft contact shadow on the marble beneath it (shadow opacity ~30-40%).
- The polished marble shows a soft, slightly blurred reflection of the product's base.
- Very subtle photographic film grain consistent with ISO 400.

FORBIDDEN ELEMENTS (never include):
- Track lights, spotlights, any visible light fixtures
- Visible ceiling or ceiling line
- Pedestals, display cases, ropes, stanchions
- Other objects, people, signage
- Columns, rails, baseboards, doorways

COMPOSITION:
- Format: ${aspectRatio === '3:2' ? 'Landscape 3:2 (1536×1024 pixels)' : 'Square 1:1 (1024×1024 pixels)'}
- Product CENTERED horizontally in the frame
- Product sits on the floor in the lower-center area, naturally grounded
- Camera: Straight-on view, slightly elevated (~15° above floor level)

${placardSection}

FINAL REMINDER: The product in your output must be pixel-for-pixel identical to the input. Do not redraw it.`;

    const systemPrompt = `You are a world-class museum photography compositor specializing in creating photorealistic gallery images. Every image you create follows these IMMUTABLE rules:
- WALL: Always dark charcoal gray (#4A4A4E–#55555A), smooth matte plaster. No ceiling, no lights, no fixtures ever visible.
- FLOOR: Always LIGHT warm-toned marble (#D9CFC2 to #E5DDD2 base) — light beige/cream/ivory with subtle soft warm veining. Highly polished glossy surface. NOT dark brown, NOT Emperador Dark, NOT gray, NOT cool-toned. Think Crema Marfil or Botticino marble.
- LIGHTING: Warm diffused ambient (~3200K), no visible sources. Soft contact shadows. Subtle film grain.
- COMPOSITION: Product always dead-center horizontally, grounded on the floor with realistic shadow and marble reflection.
- ATMOSPHERE: Subtle depth haze, warm color grading, photographic quality indistinguishable from a real DSLR photograph.`;

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
            role: "system",
            content: systemPrompt,
          },
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
