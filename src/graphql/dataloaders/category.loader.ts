import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

export function createCategoryLoader(prisma: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const categories = await prisma.category.findMany({
      where: { id: { in: ids as string[] } }
    });
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    return ids.map(id => categoryMap.get(id));
  });
}
