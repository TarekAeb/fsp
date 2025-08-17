import authConfig from "@/auth"
import { getServerSession } from "next-auth";

export const currentUser = async () => {
  const session = await getServerSession(authConfig);

  return session?.user;
};

export const currentRole = async () => {
  const session = await getServerSession(authConfig);

  return session?.user?.role;
};