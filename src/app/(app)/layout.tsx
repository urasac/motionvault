import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { avatarColor: true },
  });

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <AppNav
        username={user.username}
        avatarColor={dbUser?.avatarColor ?? "#6d28d9"}
      />
      <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
