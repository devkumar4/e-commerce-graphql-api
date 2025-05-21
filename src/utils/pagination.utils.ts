export function getPagination(offset?: number, limit?: number) {
  return {
    skip: offset || 0,
    take: limit || 10
  };
}
