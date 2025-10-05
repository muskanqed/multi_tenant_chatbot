// ============================================
// app/api/chat/route.ts - Chat Endpoint with Streaming
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { streamGeminiResponse } from '@/lib/gemini';
import { saveChatMessage } from '@/lib/chatHistory';
import { getTenantConfig } from '@/lib/tenantConfig';

export async function POST(req: NextRequest) {
  try {
    const { message, tenantId, sessionId } = await req.json();

    if (!message || !tenantId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get tenant config
    const tenant = await getTenantConfig(tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Save user message
    await saveChatMessage(tenantId, sessionId, 'user', message);

    // Stream response from Gemini
    const stream = await streamGeminiResponse(
      message,
      tenant.aiPersona,
      tenant.model
    );

    // Create a readable stream
    const encoder = new TextEncoder();
    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text();
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          }

          // Save complete assistant response
          await saveChatMessage(
            tenantId,
            sessionId,
            'assistant',
            fullResponse
          );

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
