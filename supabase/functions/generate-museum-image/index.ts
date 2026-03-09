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

    const { imageBase64, backgroundBase64, artifactNumber, title, origin, material, estimatedAge, size, showPlacard = true, aspectRatio = '1:1' } = await req.json();

    if (!imageBase64) {
      throw new Error("imageBase64 is required");
    }

    const placardSection = showPlacard ? `
MUSEUM PLACARD — CRITICAL ELEMENT, MUST BE PERFECT:

VISIBILITY & Z-ORDER (HIGHEST PRIORITY):
- The placard MUST be clearly visible, fully readable, and NEVER obscured by the product or any other element.
- The placard is the TOP-MOST LAYER — it renders IN FRONT of everything else. If the product and placard overlap, the placard is ALWAYS on top.
- The placard must be LARGE ENOUGH to read all text clearly. Width = 15% of image width.

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
- ABSOLUTELY NO PLACARD: Do NOT include any text card, label, placard, caption, or any form of text overlay anywhere in the image. The scene must contain ONLY the product and the background. Nothing else. ZERO text elements anywhere.
`;

    const backgroundInstruction = backgroundBase64
      ? `
######## CRITICAL — BACKGROUND REFERENCE IMAGE ########

The SECOND image provided is the EXACT background you MUST use. This is NON-NEGOTIABLE.

You MUST reproduce this EXACT background environment:
- The EXACT same dark marble/stone floor with the same crack patterns, veining, and texture
- The EXACT same dark smoky/cloudy wall atmosphere above the floor
- The EXACT same lighting, color tones, and mood
- The EXACT same camera angle and perspective of the floor/wall
- The background must be IDENTICAL in every generated image — same floor, same wall, same atmosphere

DO NOT create a different background. DO NOT interpret or reimagine the background. Copy it EXACTLY as shown in the reference image.

The only thing that changes between images is the product placed on this background.
########################################################
`
      : `
ENVIRONMENT — USE THE STANDARD DARK GALLERY:
- Dark smoky/cloudy wall atmosphere in the upper portion
- Dark marble/stone floor with visible crack patterns and veining
- Moody, dramatic lighting with warm undertones
- The background must be consistent across all generated images
`;

    const prompt = `You are compositing a product photograph onto a specific museum background. This is a PHOTO COMPOSITING task, NOT an image generation task.

######## CRITICAL — PRODUCT PRESERVATION (READ THIS FIRST) ########

THE PRODUCT MUST REMAIN 100% UNCHANGED. THIS IS NON-NEGOTIABLE.

You are NOT generating a new image of the product. You are EXTRACTING the product from the FIRST input photograph and PLACING it onto the background shown in the SECOND image. The product pixels must be IDENTICAL to the input.

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
- Extract/cut out the product EXACTLY as it appears in the FIRST image
- Place the product onto the background from the SECOND image with ZERO modifications to the product
- The product should look like it was photographed in this environment, not generated

Think of this as Photoshop compositing: Select → Cut → Paste. The product pixels are sacred and untouchable.

######## END PRODUCT PRESERVATION RULES ########

${backgroundInstruction}

COMPOSITION:
- Format: ${aspectRatio === '3:2' ? 'Landscape 3:2 (1536×1024 pixels)' : 'Square 1:1 (1024×1024 pixels)'}
- Product CENTERED horizontally in the frame
- Product sits on the floor in the lower-center area, naturally grounded
- The product casts a realistic soft contact shadow on the floor beneath it
- Camera angle should match the background reference image perspective

MUSEUM LIGHTING (CRITICAL — makes the product feel like a real gallery exhibit):
- A single warm spotlight (3200K tungsten) from above-front illuminates the product like a real museum track light
- The spotlight creates a soft, focused pool of light on and around the product
- Gentle rim lighting on the product edges to separate it from the dark background
- Subtle warm highlights on the top surfaces of the product, as if lit from a ceiling spot
- The surrounding environment stays darker, drawing the eye to the product (vignette effect)
- Soft diffused ambient fill light so shadows are not pitch black — like a real gallery
- A faint reflection/glow of the product on the polished floor beneath it
- The lighting should feel like ISO 400, f/4, professional DSLR museum photography
- DO NOT change the product's actual colors or textures — only add realistic ENVIRONMENTAL lighting interaction (highlights, rim light, shadows)

${placardSection}

FINAL REMINDER: The product in your output must be pixel-for-pixel identical to the FIRST input image. The background must be identical to the SECOND input image. Do not redraw either.`;

    const systemPrompt = `You are a world-class museum photography compositor. Your job is to composite products onto a provided background image with perfect photorealism. IMMUTABLE rules:
- The product from the FIRST image must NEVER be modified in any way — preserve it pixel-for-pixel
- The background from the SECOND image must be reproduced EXACTLY — same textures, colors, lighting, atmosphere
- Every output must have the IDENTICAL background — consistency is paramount
- Add only a natural contact shadow beneath the product to ground it realistically
- The result must look like a real DSLR photograph, indistinguishable from reality
- Apply museum-quality LIGHTING that makes the product feel like a prestigious gallery exhibit`;

    // Build message content with product image and optionally background reference
    const messageContent: any[] = [
      { type: "text", text: prompt },
      {
        type: "image_url",
        image_url: { url: imageBase64 },
      },
    ];

    if (backgroundBase64) {
      messageContent.push({
        type: "image_url",
        image_url: { url: backgroundBase64 },
      });
    }

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
            content: messageContent,
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
