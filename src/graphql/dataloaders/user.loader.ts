import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

export function createUserLoader(prisma: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    return ids.map((id) => userMap.get(id));
  });
}
