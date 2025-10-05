// ============================================
// app/api/chat/sessions/route.ts - Get User Chat Sessions
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { getUserChatSessions } from "@/lib/chatHistory";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || "default";
    const userId = searchParams.get("userId") || undefined;

    const sessions = await getUserChatSessions(tenantId, userId);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Sessions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
