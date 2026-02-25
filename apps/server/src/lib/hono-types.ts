import { Session, User } from "better-auth";

export type Vars = {
  user: User | null;
  session: Session | null;
};
