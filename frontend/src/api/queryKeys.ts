export const queryKeys = {
  boats: ['boats'] as const,
  documents: (boatId: number) => ['documents', boatId] as const,
  maintenance: (boatId: number) => ['maintenance', boatId] as const,
  todos: (boatId: number) => ['todos', boatId] as const,
  shopping: (boatId: number) => ['shopping', boatId] as const,
  logbook: (boatId: number) => ['logbook', boatId] as const,
}
