// ============================================
// app/api/chat/route.ts - Chat Endpoint with Streaming
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { streamGeminiResponse, summarizeConversation } from "@/lib/gemini";
import { saveChatMessage, getChatHistory } from "@/lib/chatHistory";
import { getTenantConfig } from "@/lib/tenantConfig";
import ChatHistory from "@/models/ChatHistory";
import { connectDB } from "@/lib/mongoose";

// Sliding window configuration
const SLIDING_WINDOW_SIZE = 8; // Keep last 15 messages in full context
const SUMMARIZE_THRESHOLD = 15; // Start summarizing when conversation exceeds 20 messages

export async function POST(req: NextRequest) {
  try {
    const { message, tenantId, sessionId, userId } = await req.json();

    if (!message || !sessionId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields (message, sessionId, userId)" },
        { status: 400 }
      );
    }

    // Default AI configuration if no tenant
    let aiPersona = "You are a helpful AI assistant.";
    let modelName = "gemini-2.5-pro";

    // Get tenant config if tenantId provided
    if (tenantId) {
      const tenant = await getTenantConfig(tenantId);
      if (tenant) {
        aiPersona = tenant.aiPersona;
        modelName = tenant.model;
      }
    }

    // Save user message
    try {
      await saveChatMessage(userId, sessionId, "user", message);
    } catch (error) {
      console.warn("Failed to save user message:", error);
    }

    // Get conversation history for context
    const chatHistory = await getChatHistory(userId, sessionId);
    const allMessages =
      chatHistory?.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) || [];

    let conversationHistory: Array<{
      role: "user" | "assistant";
      content: string;
    }> = [];
    let currentSummary = chatHistory?.summary;
    let shouldUpdateSummary = false;

    // Implement sliding window with summarization
    if (allMessages.length > SUMMARIZE_THRESHOLD) {
      const messagesToKeep = allMessages.slice(-SLIDING_WINDOW_SIZE);
      const messagesToSummarize = allMessages.slice(0, -SLIDING_WINDOW_SIZE);

      const lastSummarizedIndex = chatHistory?.summarizedUpToIndex ?? -1;
      const newMessagesToSummarize = messagesToSummarize.slice(
        lastSummarizedIndex + 1
      );

      // Only create/update summary if there are new messages to summarize
      if (newMessagesToSummarize.length > 0) {
        try {
          console.log(
            `Summarizing ${
              newMessagesToSummarize.length
            } messages (existing summary: ${!!currentSummary})`
          );
          currentSummary = await summarizeConversation(
            newMessagesToSummarize,
            currentSummary
          );
          shouldUpdateSummary = true;
        } catch (error) {
          console.warn("Failed to create summary:", error);
        }
      }

      // Build context: summary as system context + recent messages
      if (currentSummary) {
        // Add summary as first "assistant" message to provide context
        conversationHistory.push({
          role: "assistant",
          content: `[Previous conversation summary: ${currentSummary}]`,
        });
      }
      conversationHistory.push(...messagesToKeep);
    } else {
      // Use all messages if under threshold
      conversationHistory = allMessages;
    }

    // Stream response from Gemini with conversation history
    const result = await streamGeminiResponse(
      message,
      aiPersona,
      modelName,
      conversationHistory
    );

    // Create a readable stream with abort handling
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        let isClosed = false;

        // Handle client disconnect/abort
        const abortHandler = () => {
          console.log("Client disconnected - aborting stream");
          if (!isClosed) {
            isClosed = true;
            try {
              controller.close();
            } catch (e) {
              // Controller already closed, ignore
            }
          }
        };

        req.signal.addEventListener("abort", abortHandler);

        try {
          for await (const chunk of result.stream) {
            // Check if client has disconnected
            if (req.signal.aborted) {
              console.log("Request aborted, stopping generation");
              break;
            }

            const text = chunk.text();
            fullResponse += text;

            if (!isClosed) {
              controller.enqueue(encoder.encode(text));
            }
          }

          // Get token usage after stream completes
          let tokenData = null;
          try {
            const response = await result.response;
            const usageMetadata = response.usageMetadata;
            if (usageMetadata) {
              tokenData = {
                promptTokens: usageMetadata.promptTokenCount || 0,
                responseTokens: usageMetadata.candidatesTokenCount || 0,
                totalTokens: usageMetadata.totalTokenCount || 0,
              };

              // Send token data as special marker at the end
              if (!isClosed) {
                controller.enqueue(
                  encoder.encode(
                    `\n__TOKEN_USAGE__${JSON.stringify(tokenData)}`
                  )
                );
              }
            }
          } catch (error) {
            console.warn("Failed to get token usage:", error);
          }

          // Save complete assistant response only if not aborted
          if (!req.signal.aborted && fullResponse) {
            try {
              await saveChatMessage(
                userId,
                sessionId,
                "assistant",
                fullResponse,
                tokenData || undefined
              );

              // Save updated summary if it was generated
              if (shouldUpdateSummary && currentSummary) {
                await connectDB();
                const totalMessages = allMessages.length + 1; // +1 for the new assistant message
                const newSummarizedIndex =
                  totalMessages - SLIDING_WINDOW_SIZE - 1;

                await ChatHistory.findOneAndUpdate(
                  { userId, sessionId },
                  {
                    summary: currentSummary,
                    summarizedUpToIndex: newSummarizedIndex,
                  }
                );
                console.log(
                  `Summary saved. Summarized up to index: ${newSummarizedIndex}`
                );
              }
            } catch (error) {
              console.warn("Failed to save assistant message:", error);
            }
          }

          if (!isClosed) {
            isClosed = true;
            controller.close();
          }
        } catch (error) {
          console.error("Stream error:", error);
          if (!isClosed) {
            isClosed = true;
            try {
              controller.error(error);
            } catch (e) {
              // Controller already closed, ignore
            }
          }
        } finally {
          req.signal.removeEventListener("abort", abortHandler);
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
