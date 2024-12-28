// Example of a Prisma-based handler to fetch streams and their vote counts
import { prismaClient } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const streams = await prismaClient.stream.findMany({
      include: {
        upvotes: { // Assuming `upvotes` is a relation to count votes
          select: { userId: true }, // To count how many votes a stream has
        },
      },
    });

    // Calculate votes from the upvotes relation
    const streamsWithVotes = streams.map((stream) => ({
      id: stream.id,
      title: stream.title,
      upvotes: stream.upvotes.length, // Count the number of upvotes
    }));

    return NextResponse.json({ streams: streamsWithVotes });
  } catch (error) {
    console.error("Error fetching streams:", error);
    return NextResponse.json({ error: "Error fetching streams" }, { status: 500 });
  }
}
