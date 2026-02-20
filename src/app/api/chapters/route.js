import dbConnect from '../../../../lib/mongodb';
import Chapter from '../../../../models/Chapter';
import { verifyAdminWithRole, unauthorizedResponse } from '../../../../lib/auth-utils';

// GET /api/chapters — Public: list non-archived chapters
export async function GET() {
    try {
        await dbConnect();
        const chapters = await Chapter.find({ isArchived: { $ne: true } }).sort({ status: 1, city: 1 });
        return Response.json({ chapters });
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return Response.json({ error: 'Failed to fetch chapters' }, { status: 500 });
    }
}

// POST /api/chapters — Super admin: create chapter
export async function POST(request) {
    const auth = await verifyAdminWithRole(request);
    if (!auth || auth.role !== 'super_admin') return unauthorizedResponse();

    try {
        await dbConnect();
        const body = await request.json();
        const chapter = await Chapter.create(body);
        return Response.json({ chapter }, { status: 201 });
    } catch (error) {
        console.error('Error creating chapter:', error);
        return Response.json({ error: 'Failed to create chapter' }, { status: 500 });
    }
}
