import dbConnect from '../../../../../../lib/mongodb';
import Chapter from '../../../../../../models/Chapter';
import { verifyAdminWithRole, unauthorizedResponse } from '../../../../../../lib/auth-utils';

// PUT /api/chapters/[id]/archive — Toggle archive status
export async function PUT(request, { params }) {
    const auth = await verifyAdminWithRole(request);
    if (!auth || auth.role !== 'super_admin') return unauthorizedResponse();

    try {
        await dbConnect();
        const { id } = await params;
        const chapter = await Chapter.findById(id);

        if (!chapter) {
            return Response.json({ error: 'Chapter not found' }, { status: 404 });
        }

        chapter.isArchived = !chapter.isArchived;
        await chapter.save();

        return Response.json({
            chapter,
            message: chapter.isArchived ? 'Chapter archived' : 'Chapter unarchived'
        });
    } catch (error) {
        console.error('Error archiving chapter:', error);
        return Response.json({ error: 'Failed to archive chapter' }, { status: 500 });
    }
}
