import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpvoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  // Ensure that the session and session.user are defined
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prismaClient.user.findFirst({
    where: { email: session.user.email as string },
  });

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = UpvoteSchema.parse(await req.json());

    // Check if the user has already upvoted
    const existingUpvote = await prismaClient.upvote.findFirst({
      where: { userId: user.id, streamId: data.streamId },
    });

    // If the user has already upvoted, prevent multiple upvotes
    if (existingUpvote) {
      return NextResponse.json({ message: "Already upvoted" }, { status: 400 });
    }

    // Create the upvote
    await prismaClient.upvote.create({
      data: {
        userId: user.id,
        streamId: data.streamId,
      },
    });

    // Optionally, update the upvote count directly in the stream (if necessary)
    const updatedStream = await prismaClient.stream.update({
      where: { id: data.streamId },
      data: {
        // You could track the total upvotes count here, if needed
      },
    });

    return NextResponse.json({ message: "Upvoted successfully" });
  } catch (error) {
    console.error("Error processing upvote:", error);
    return NextResponse.json({ message: "Error processing upvote" }, { status: 500 });
  }
}
