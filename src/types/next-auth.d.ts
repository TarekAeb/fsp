import { UserRole } from "@/db/enums";
import { DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  id: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}