// ============================================
// app/api/chat/route.ts - Chat Endpoint with Streaming
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { streamGeminiResponse } from "@/lib/gemini";
import { saveChatMessage } from "@/lib/chatHistory";
import { getTenantConfig } from "@/lib/tenantConfig";

export async function POST(req: NextRequest) {
  try {
    const { message, tenantId, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Default AI configuration if no tenant
    let aiPersona = "You are a helpful AI assistant.";
    let modelName = "gemini-2.5-pro";
    const effectiveTenantId = tenantId || "default";

    // Get tenant config if tenantId provided
    if (tenantId) {
      const tenant = await getTenantConfig(tenantId);
      if (tenant) {
        aiPersona = tenant.aiPersona;
        modelName = tenant.model;
      }
    }

    // Save user message (optional - only if chat history is needed)
    try {
      await saveChatMessage(effectiveTenantId, sessionId, "user", message);
    } catch (error) {
      console.warn("Failed to save user message:", error);
    }

    // Stream response from Gemini
    const stream = await streamGeminiResponse(message, aiPersona, modelName);

    // Create a readable stream
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text();
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          }

          // Save complete assistant response (optional)
          try {
            await saveChatMessage(
              effectiveTenantId,
              sessionId,
              "assistant",
              fullResponse
            );
          } catch (error) {
            console.warn("Failed to save assistant message:", error);
          }

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
