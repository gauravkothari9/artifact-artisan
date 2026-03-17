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

    const { imageBase64, backgroundUrl, backgroundBase64, artifactNumber, title, origin, material, estimatedAge, size, showPlacard = true, aspectRatio = '1:1' } = await req.json();

    if (!imageBase64) {
      throw new Error("imageBase64 is required");
    }

    // Fetch background as base64 from URL if provided, otherwise use inline base64
    let bgBase64 = backgroundBase64;
    if (!bgBase64 && backgroundUrl) {
      try {
        const bgResponse = await fetch(backgroundUrl);
        const bgBlob = await bgResponse.blob();
        const bgArrayBuffer = await bgBlob.arrayBuffer();
        const bgUint8Array = new Uint8Array(bgArrayBuffer);
        let binary = '';
        for (let i = 0; i < bgUint8Array.length; i++) {
          binary += String.fromCharCode(bgUint8Array[i]);
        }
        const bgB64 = btoa(binary);
        const contentType = bgResponse.headers.get('content-type') || 'image/png';
        bgBase64 = `data:${contentType};base64,${bgB64}`;
      } catch (e) {
        console.error("Failed to fetch background image:", e);
      }
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

    const backgroundInstruction = bgBase64
      ? `
######## ABSOLUTE REQUIREMENT — BACKGROUND IMAGE (READ CAREFULLY) ########

The SECOND image is the EXACT background you MUST use. This is NOT a reference or inspiration — it IS the background.

This is a LAYER COMPOSITING task. Think of it exactly like Photoshop:
- Layer 0 (LOCKED): The SECOND image = your background. DO NOT TOUCH IT.
- Layer 1: The product cut out from the FIRST image, placed on top.
- That's it. Two layers. Nothing else.

YOUR OUTPUT MUST CONTAIN THE EXACT SAME BACKGROUND PIXELS AS THE SECOND IMAGE.

ABSOLUTELY FORBIDDEN — violating ANY of these rules means FAILURE:
- DO NOT reinterpret, reimagine, regenerate, or redraw ANY part of the background
- DO NOT change the floor texture, color, crack patterns, veining, or surface detail in any way
- DO NOT change the wall atmosphere, smoke patterns, haze, colors, or gradients
- DO NOT add ANY lighting effects — NO spotlights, NO directional light, NO rim light, NO glow, NO highlights
- DO NOT brighten, darken, warm, cool, shift, or recolor ANY part of the background
- DO NOT create a "similar looking" or "inspired by" background — use the EXACT pixels
- DO NOT add reflections, puddles, fog, or any elements not already in the SECOND image
- DO NOT smooth, sharpen, blur, or filter the background in any way
- DO NOT change the perspective, crop, or framing of the background

REQUIRED:
- Copy the SECOND image as-is for the background — every pixel must match
- The ONLY addition to the scene is: the product placed on top + a subtle contact shadow directly beneath it
- The background wall, floor, cracks, smoke, lighting — ALL must be IDENTICAL to the SECOND image

If your output background looks even slightly different from the SECOND image, you have FAILED the task.
########################################################
`
      : `
ENVIRONMENT — USE THE STANDARD DARK GALLERY:
- Dark smoky/cloudy wall atmosphere in the upper portion
- Dark marble/stone floor with visible crack patterns and veining
- Soft, natural ambient lighting — NO spotlights, NO directional lights, NO artificial light sources
- The background must be consistent across all generated images
`;

    const prompt = `You are compositing a product photograph onto a specific museum background. This is a PHOTO COMPOSITING task — like Photoshop layer compositing. You are NOT generating new imagery.

######## CRITICAL — PRODUCT PRESERVATION (READ THIS FIRST) ########

THE PRODUCT MUST REMAIN 100% UNCHANGED. THIS IS NON-NEGOTIABLE.

You are EXTRACTING the product from the FIRST image and PLACING it onto the background from the SECOND image. Both must remain pixel-identical to their inputs.

FORBIDDEN — DO NOT DO ANY OF THESE TO THE PRODUCT:
- DO NOT redraw, regenerate, re-render, or re-imagine the product
- DO NOT change shape, silhouette, proportions, colors, textures, or materials
- DO NOT add or remove lighting, shadows, highlights, or reflections ON the product
- DO NOT change angle, orientation, pose, or perspective
- DO NOT simplify, stylize, smooth, sharpen, blur, or "improve" the product

REQUIRED:
- Extract/cut out the product EXACTLY as it appears in the FIRST image
- Place it onto the UNCHANGED background from the SECOND image

######## END PRODUCT PRESERVATION RULES ########

${backgroundInstruction}

COMPOSITION:
- Format: ${aspectRatio === '3:2' ? 'Landscape 3:2 (1536×1024 pixels)' : 'Square 1:1 (1024×1024 pixels)'}
- Product CENTERED horizontally in the frame
- Product sits on the floor in the lower-center area, naturally grounded
- Add ONLY a subtle contact shadow directly beneath the product on the floor
- Camera angle should match the background reference image perspective

${placardSection}

FINAL REMINDER: Background = SECOND image, unchanged. Product = FIRST image, unchanged. You are only compositing them together.`;

    const systemPrompt = `You are a photo compositing engine. Your ONLY job is to composite a product (from the FIRST input image) onto a background (from the SECOND input image). STRICT RULES:
- The background from the SECOND image must appear EXACTLY as provided — do not redraw, reinterpret, or modify it in any way
- The product from the FIRST image must be preserved pixel-for-pixel — do not redraw or modify it
- Add ONLY a subtle contact shadow beneath the product
- NO spotlights, NO directional lights, NO artificial lighting — the scene lighting must match exactly what's in the reference background
- Output must look like a real photograph — seamless compositing only`;

    // Build message content with product image and optionally background reference
    const messageContent: any[] = [
      { type: "text", text: prompt },
      {
        type: "image_url",
        image_url: { url: imageBase64 },
      },
    ];

    if (bgBase64) {
      messageContent.push({
        type: "image_url",
        image_url: { url: bgBase64 },
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
