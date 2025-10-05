// ============================================
// app/api/chat/history/route.ts - Get Chat History for a Session
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { getChatHistory } from "@/lib/chatHistory";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "default";
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const history = await getChatHistory(tenantId, sessionId);

    if (!history) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: history.messages });
  } catch (error) {
    console.error("History API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
