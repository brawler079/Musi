import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server"
import {z} from "zod";
var YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;


const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()
})

export async function POST(req: NextRequest) {
    try {
        const data =  CreateStreamSchema.parse(await req.json());
        const isYt = data.url.match(YT_REGEX);

        if(!isYt) {
            return NextResponse.json({
                message: "Wrong URl format"
            }, {
                status: 411,
            })
        }

        const extractedId = data.url.split("?v=")[1];

        const stream = await prismaClient.stream.create({
            data: {
            userId: data.creatorId,
            url: data.url,
            extractedId,
            type: "Youtube"
            }
        })

        return NextResponse.json({
            message: "Stream added successfully",
            id: stream.id
        }, {
            status: 200
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: "Error while adding stream here"
        }, {
            status: 411,
        })
    }
}

export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const streams = await prismaClient.stream.findMany({
        where: {
            userId: creatorId ?? "",
        }
    });
    return NextResponse.json({
        streams,
    });
}