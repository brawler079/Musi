import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { z } from "zod";

const UpvoteSchema = z.object({
    streamId: z.string(),
})

export async function POST(req: NextRequest) {
    const session = await getServerSession();

    if (!session?.user?.email) {
        return new Response("Unauthorized", { status: 403 });
    }
    
    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    });
    if(!user) {
        return new Response("Unauthorized", { status: 403 });
    }

    try {
        const data = UpvoteSchema.parse(await req.json());

        await prismaClient.upvote.delete({
            where: {
                userId_streamId: {
                    userId: user.id,
                    streamId: data.streamId
                }
            }
        })

    } catch (error) {
        return new Response("Error while upvoting stream", { status: 403 });
        
    }

    const data = UpvoteSchema.parse(await req.json());
}