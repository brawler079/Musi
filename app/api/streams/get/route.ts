import { prismaClient } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch streams with the count of upvotes and sort them by the number of upvotes
    const streams = await prismaClient.stream.findMany({
      select: {
        id: true,
        title: true,
        // Use the `count` function to count the related upvotes
        _count: {
          select: {
            upvotes: true, // Count the number of upvotes
          },
        },
      },
      orderBy: {
        upvotes: {
          _count: "desc", // Sort by the count of upvotes in descending order
        },
      },
    });

    // Map the streams to a format suitable for the frontend
    const streamsWithVotes = streams.map((stream) => ({
      id: stream.id,
      title: stream.title,
      upvotes: stream._count.upvotes, // Access the count of upvotes
    }));

    return NextResponse.json({ streams: streamsWithVotes }); // Return the sorted streams
  } catch (error) {
    console.error("Error fetching streams:", error);
    return NextResponse.json({ error: "Failed to fetch streams" }, { status: 500 });
  }
}
