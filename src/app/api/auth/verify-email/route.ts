import { prisma } from "@/lib/prisma";
import { UserDAO } from "@/dao/user.dao";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 400 });
  }
  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    return new Response(JSON.stringify({ message: 'Token not found' }), { status: 400 });
  }

  const now = new Date();
  if (!user.emailVerificationTokenExpiresAt || now > new Date(user.emailVerificationTokenExpiresAt)) {
    return new Response(JSON.stringify({ message: 'Token expired' }), { status: 400 });
  }

  await UserDAO.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    });

  return new Response(JSON.stringify({ message: 'Email verified successfully' }), { status: 200 });
}
