import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

export function createProductLoader(prisma: PrismaClient) {
  return new DataLoader(async (ids: readonly string[]) => {
    const products = await prisma.product.findMany({
      where: { id: { in: ids as string[] } }
    });
    const productMap = new Map(products.map(p => [p.id, p]));
    return ids.map(id => productMap.get(id));
  });
}
