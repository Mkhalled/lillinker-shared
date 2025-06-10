import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";;

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    console.log("HIT: /api/admin GET request");
  try {
    // Ensure token is extracted correctly
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (token.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
      emailVerified: true,
      isActive: false
      },
      select: {
      firstname: true, 
      lastname: true, 
      email: true,
      role: {
        select: {
        name: true 
        }
      },      
      company: true    
      }
    });

    return NextResponse.json({ message: "Welcome admin!", users }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
