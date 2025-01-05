import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "Unauthorized: Email not found in session." },
                { status: 401 }
            );
        }

        const user = await prismaClient.user.findFirst({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found in the database." },
                { status: 404 }
            );
        }

        const mostUpvotedStream = await prismaClient.stream.findFirst({
            where: { userId: user.id, played: false },
            orderBy: { upvotes: { _count: "desc" } },
        });

        if (!mostUpvotedStream) {
            return NextResponse.json(
                { message: "No streams available to skip. Please add more streams." },
                { status: 404 }
            );
        }

        await prismaClient.$transaction([
            prismaClient.currentStream.upsert({
                where: { userId: user.id },
                update: { streamId: mostUpvotedStream.id },
                create: { userId: user.id, streamId: mostUpvotedStream.id },
            }),
            prismaClient.stream.update({
                where: { id: mostUpvotedStream.id },
                data: { played: true, playedAt: new Date() },
            }),
        ]);

        return NextResponse.json({ stream: mostUpvotedStream });
    } catch (error) {
        console.error("Error processing request:", error instanceof Error ? error.message : error);
        return NextResponse.json(
            { message: "Something went wrong. Please try again later." },
            { status: 500 }
        );
    }
}
