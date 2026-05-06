export const databaseMapping = {
  Users: "dbid-users-123",
  Posts: "dbid-posts-456",
} as const;

export type DatabaseMapping = typeof databaseMapping;
