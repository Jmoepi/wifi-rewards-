import { redirect } from "next/navigation";
import { getSession } from "./session";
import { prisma } from "./prisma";

export async function verifySession() {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId };
}

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      sbBalance: true,
      createdAt: true,
    },
  });

  return user;
}
