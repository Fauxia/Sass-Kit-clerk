import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { createUser } from "@/actions/createUser";

export async function POST(req: Request) {
  console.log("Webhook received at:", new Date().toISOString());

  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    console.error("Missing SIGNING_SECRET environment variable");
    return new Response("Configuration error", {
      status: 500,
    });
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  console.log("Webhook headers received:", {
    hasId: !!svix_id,
    hasTimestamp: !!svix_timestamp,
    hasSignature: !!svix_signature,
  });

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  console.log("Webhook payload received:", body);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("Webhook verified successfully");
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Processing webhook type: ${eventType}`);

  if (eventType === "user.created") {
    try {
      const { email_addresses, id } = evt.data;
      console.log(
        "Processing user creation for:",
        email_addresses?.[0]?.email_address
      );

      if (!email_addresses?.[0]?.email_address) {
        throw new Error("No email address provided");
      }

      const result = await createUser(email_addresses[0].email_address);
      console.log("Create user result:", result);

      if (!result.success) {
        console.error("Failed to create user:", result.error);
        if (result.error === "User already exists") {
          return new Response("User processed", { status: 200 });
        }
        return new Response("Failed to process user", { status: 500 });
      }

      if (result.user?._id) {
        try {
          console.log("Updating Clerk metadata for user:", id);
          const clerk = await clerkClient();
          await clerk.users.updateUserMetadata(id, {
            publicMetadata: {
              userId: result.user._id,
            },
          });
          console.log("Clerk metadata updated successfully");
        } catch (error) {
          console.error("Failed to update Clerk metadata:", error);
        }
      }
    } catch (error) {
      console.error("Error processing user creation:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }

  console.log(`Processed webhook ID ${id} of type ${eventType}`);
  return new Response("Webhook received", { status: 200 });
}
