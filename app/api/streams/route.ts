import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// @ts-ignore
import youtubesearchapi from "youtube-search-api";
import { YT_REGEX } from "@/app/lib/utils";

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()
});

export async function POST(req: NextRequest) {
    try {
        const data = CreateStreamSchema.parse(await req.json());

        const isYt = data.url.match(YT_REGEX);
        if (!isYt) {
            return NextResponse.json({
                message: "Wrong URL format"
            }, {
                status: 411,
            });
        }

        const extractedId = data.url.split("?v=")[1];

        const res = await youtubesearchapi.GetVideoDetails(extractedId);

        if (!res) {
            return NextResponse.json({
                message: "No video found"
            }, {
                status: 411,
            });
        }

        const thumbnails = res.thumbnail.thumbnails;
        thumbnails.sort((a: { width: number }, b: { width: number }) => a.width < b.width ? -1 : 1);

        const stream = await prismaClient.stream.create({
            data: {
                userId: data.creatorId,
                url: data.url,
                extractedId,
                type: "Youtube",
                title: res.title,
                smallImg: thumbnails.length > 1
                    ? thumbnails[thumbnails.length - 2].url
                    : thumbnails[thumbnails.length - 1].url ?? "",
                bigImg: thumbnails[thumbnails.length - 1].url ?? "",
            },
        });

        return NextResponse.json({
            message: "Stream added successfully",
            id: stream.id
        }, {
            status: 200
        });

    } catch (error) {
        const err = error as Error;
        console.log("Error found: ", err.message);
        return NextResponse.json({
            message: "Something went wrong",
        }, {
            status: 500
        });
    }
}

export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get("creatorId")?.toString()?.trim();

    if (!creatorId) {
        return NextResponse.json(
            { message: "Creator ID not found" },
            { status: 400 }
        );
    }

    try {
        const [streams, activeStream] = await Promise.all([
            prismaClient.stream.findMany({
                where: { userId: creatorId, played: false },
                select: {
                    id: true,
                    title: true,
                    extractedId: true,
                    userId: true,
                    _count: {
                        select: { upvotes: true },
                    },
                },
                orderBy: {
                    upvotes: {
                        _count: "desc",
                    },
                },
            }),
            prismaClient.currentStream.findFirst({
                where: { userId: creatorId },
            }),
        ]);

        const formattedStreams = streams.map(({ _count, ...rest }) => ({
            ...rest,
            upvotes: _count.upvotes,
        }));

        return NextResponse.json(
            {
                streams: formattedStreams,
                activeStream: activeStream || null,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching streams:", error);
        return NextResponse.json(
            { error: "Failed to fetch streams" },
            { status: 500 }
        );
    }
}
