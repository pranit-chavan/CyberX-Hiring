import dbConnect from '../../../../lib/mongodb';
import Target from '../../../../models/Target';

export async function GET(req) {
    await dbConnect();

    try {
        const targets = await Target.find({}).sort({ createdAt: -1 });
        return Response.json({ success: true, data: targets });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(req) {
    await dbConnect();

    try {
        const body = await req.json();
        const target = await Target.create(body);
        return Response.json({ success: true, data: target }, { status: 201 });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 400 });
    }
}
