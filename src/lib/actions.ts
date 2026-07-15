"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureWatchlist, upsertTitle, type TitleInput } from "@/lib/title-cache";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be signed in to do that");
  }
  return session.user.id;
}

export async function logWatchAction(input: {
  title: TitleInput;
  rating?: number;
  review?: string;
  watchedOn?: string;
  rewatch?: boolean;
}) {
  const userId = await requireUserId();
  const title = await upsertTitle(input.title);

  const entry = await prisma.watchEntry.create({
    data: {
      userId,
      titleId: title.id,
      rating: input.rating ? Math.max(1, Math.min(10, Math.round(input.rating))) : null,
      review: input.review?.trim() || null,
      watchedOn: input.watchedOn ? new Date(input.watchedOn) : new Date(),
      rewatch: Boolean(input.rewatch),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/diary");
  revalidatePath(`/title/${input.title.mediaType.toLowerCase()}/${input.title.tmdbId}`);
  return { id: entry.id };
}

export async function deleteWatchEntryAction(entryId: string) {
  const userId = await requireUserId();
  const entry = await prisma.watchEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== userId) {
    throw new Error("Not found");
  }
  await prisma.watchEntry.delete({ where: { id: entryId } });
  revalidatePath("/dashboard");
  revalidatePath("/diary");
}

export async function toggleWatchlistAction(input: TitleInput) {
  const userId = await requireUserId();
  const [title, watchlist] = await Promise.all([
    upsertTitle(input),
    ensureWatchlist(userId),
  ]);

  const existing = await prisma.listItem.findUnique({
    where: { listId_titleId: { listId: watchlist.id, titleId: title.id } },
  });

  if (existing) {
    await prisma.listItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.listItem.create({
      data: { listId: watchlist.id, titleId: title.id },
    });
  }

  revalidatePath("/watchlist");
  revalidatePath("/dashboard");
  revalidatePath(`/title/${input.mediaType.toLowerCase()}/${input.tmdbId}`);
  return { inWatchlist: !existing };
}

export async function toggleFavoriteAction(input: TitleInput) {
  const userId = await requireUserId();
  const title = await upsertTitle(input);

  const existing = await prisma.favorite.findUnique({
    where: { userId_titleId: { userId, titleId: title.id } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId, titleId: title.id } });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/title/${input.mediaType.toLowerCase()}/${input.tmdbId}`);
  return { isFavorite: !existing };
}

export async function createListAction(name: string, description?: string) {
  const userId = await requireUserId();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("List name is required");

  const list = await prisma.list.create({
    data: { userId, name: trimmed, description: description?.trim() || null },
  });

  revalidatePath("/lists");
  return { id: list.id };
}

export async function deleteListAction(listId: string) {
  const userId = await requireUserId();
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list || list.userId !== userId || list.isWatchlist) {
    throw new Error("Not found");
  }
  await prisma.list.delete({ where: { id: listId } });
  revalidatePath("/lists");
}

export async function addToListAction(listId: string, input: TitleInput) {
  const userId = await requireUserId();
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list || list.userId !== userId) {
    throw new Error("Not found");
  }
  const title = await upsertTitle(input);
  await prisma.listItem.upsert({
    where: { listId_titleId: { listId, titleId: title.id } },
    update: {},
    create: { listId, titleId: title.id },
  });
  revalidatePath(`/lists/${listId}`);
  revalidatePath("/lists");
}

export async function removeFromListAction(listId: string, titleId: string) {
  const userId = await requireUserId();
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list || list.userId !== userId) {
    throw new Error("Not found");
  }
  await prisma.listItem.deleteMany({ where: { listId, titleId } });
  revalidatePath(`/lists/${listId}`);
  revalidatePath("/lists");
  revalidatePath("/watchlist");
}
