import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {accountActivationEmail} from "@/lib/mailer";
const prisma = new PrismaClient();
const secret = process.env.NEXTAUTH_SECRET!;

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (token.role !== "PLATFORM_ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const userId =params.id;

        await prisma.user.update({
        where: { id: userId },
        data: { isActive : true },
        });
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { firstname: true,lastname : true, email: true }
        });
        if (user) {
            const fullName = `${user.firstname} ${user.lastname}`;
            await accountActivationEmail( user.email, fullName);
        }
    return NextResponse.json({ message: "Account Activated successfully" }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}