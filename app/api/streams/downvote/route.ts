import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const DownvoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  // Ensure that the session and session.user are defined
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prismaClient.user.findFirst({
    where: { email: session.user.email! },
  });

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = DownvoteSchema.parse(await req.json());

    // Check if the user has already downvoted
    const existingDownvote = await prismaClient.upvote.findFirst({
      where: { userId: user.id, streamId: data.streamId },
    });

    // If the user has already downvoted, prevent multiple downvotes
    if (!existingDownvote) {
      return NextResponse.json({ message: "Cannot downvote without an upvote" }, { status: 400 });
    }

    // Delete the downvote (undo the upvote)
    await prismaClient.upvote.delete({
      where: {
        id: existingDownvote.id,
      },
    });

    // Optionally, update the downvote count directly in the stream (if needed)
    const updatedStream = await prismaClient.stream.update({
      where: { id: data.streamId },
      data: {
        // You could track the downvote count here, if needed
      },
    });

    return NextResponse.json({ message: "Downvoted successfully" });
  } catch (error) {
    console.error("Error processing downvote:", error);
    return NextResponse.json({ message: "Error processing downvote" }, { status: 500 });
  }
}
