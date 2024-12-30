// import { prismaClient } from "@/app/lib/db";
// import { getServerSession } from "next-auth";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//     try {
//         const session = await getServerSession();

//         if (!session || !session.user) {
//             return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//         }
    
//         const creatorId = session.user.id;
    
//         const streams = await prismaClient.stream.findMany({
//             where: { 
//                 userId: creatorId,
//             }
//         });
    
//         return NextResponse.json({
//             creatorId
//         }, {
//             status: 200
//         });
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({ message: "Error fetching user" }, { status: 500 });
//     }
// }