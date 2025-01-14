"use client";

import { useUser } from "@clerk/nextjs";

export default function Page() {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  console.log(user.publicMetadata.userId);

  return (
    <div className="flex justify-center mt-52">Hello {user.firstName}</div>
  );
}
