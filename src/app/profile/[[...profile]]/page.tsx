import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function page() {
  const { userId } = await auth();
  const user = await currentUser();
  const isAuthenticated = !!userId;
  if (!isAuthenticated) {
    redirect("/sign-up");
  }
  return <div>{user?.firstName}</div>;
}
