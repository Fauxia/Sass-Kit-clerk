import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Navbar() {
  const { userId } = await auth();
  return (
    <div className="flex items-center justify-between px-4 py-6">
      <Link href={"/"}>Brand Logo</Link>
      <Link href={"/client"}>Client</Link>
      <Link href={"/new"}>New</Link>

      {!userId ? (
        <ul>
          <Link href={"/sign-in"}>Sign in</Link>
        </ul>
      ) : (
        <div className="flex gap-3 items-center">
          <Link href={"/profile"}>Profile</Link>
          <UserButton />
        </div>
      )}
    </div>
  );
}
