import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { UserDAO } from "@/dao/user.dao";
import { logger } from "@/lib/logger";
const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    logger.info("HIT: /api/admin GET request");
  try {
    // Ensure token is extracted correctly
    const token = await getToken({ req, secret });

    if (!token) {
            logger.warn("Unauthorized access attempt");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (token.role !== "PLATFORM_ADMIN") {
      logger.warn("Access denied for user", { userId: token.id, role: token.role });
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

     const users = await UserDAO.findInactiveVerifiedUsers();
        logger.info("List appears successfully");
    return NextResponse.json({ message: "Welcome admin!", users }, { status: 200 });

  } catch (error) {
    logger.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}