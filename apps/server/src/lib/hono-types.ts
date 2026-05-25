import { Session, User } from "better-auth";

export type ApiKeyContext = {
  keyId: string;
  userId: string;
  permissions: string[];
  name: string | null;
};

export type Vars = {
  user: User | null;
  session: Session | null;
  userId: string | null;
  permission: string | null;
};
