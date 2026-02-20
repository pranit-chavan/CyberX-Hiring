import dbConnect from '../../../../../../lib/mongodb';
import Chapter from '../../../../../../models/Chapter';
import { verifyAdminWithRole, unauthorizedResponse } from '../../../../../../lib/auth-utils';

// GET /api/chapters/admin/all — List ALL chapters including archived (super_admin only)
export async function GET(request) {
    const auth = await verifyAdminWithRole(request);
    if (!auth || auth.role !== 'super_admin') return unauthorizedResponse();

    try {
        await dbConnect();
        const chapters = await Chapter.find({}).sort({ isArchived: 1, city: 1 });
        return Response.json({ chapters });
    } catch (error) {
        console.error('Error fetching all chapters:', error);
        return Response.json({ error: 'Failed to fetch chapters' }, { status: 500 });
    }
}
