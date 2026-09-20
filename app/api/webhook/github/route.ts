import { NextRequest, NextResponse } from "next/server";


export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const event = req.headers.get("x-github-event");

        if( event === "ping") {
            return NextResponse.json({message:"Pong"}, {status: 200})
        }
        console.log(`Recieved Gtihub event ${event}`)
        
        // HANDLE LATER

        return NextResponse.json({message: "Event Processes"})

    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json({error: "Internal Server Error"},
            {status: 500}
        );
    }
}