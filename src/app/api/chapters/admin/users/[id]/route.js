import dbConnect from '../../../../../../../lib/mongodb';
import Admin from '../../../../../../../models/Admin';
import { verifyAdminWithRole, unauthorizedResponse } from '../../../../../../../lib/auth-utils';

function generatePassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// PUT /api/chapters/admin/users/[id] — Update user (change password, chapter, role, generate new password)
export async function PUT(request, { params }) {
    const auth = await verifyAdminWithRole(request);
    if (!auth || auth.role !== 'super_admin') return unauthorizedResponse();

    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const { action, password, chapterId, role } = body;

        const user = await Admin.findById(id);
        if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

        // Generate new password
        if (action === 'generate_password') {
            const newPassword = generatePassword();
            user.password = newPassword;
            await user.save();
            return Response.json({ message: 'Password regenerated', generatedPassword: newPassword });
        }

        // Change password manually
        if (action === 'change_password') {
            if (!password || password.length < 6) {
                return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
            }
            user.password = password;
            await user.save();
            return Response.json({ message: 'Password updated' });
        }

        // Update user fields (chapter, role)
        if (chapterId !== undefined) user.chapterId = chapterId || null;
        if (role) user.role = role;
        await user.save();

        const updated = await Admin.findById(id).select('-password').populate('chapterId', 'city state');
        return Response.json({ message: 'User updated', user: updated });
    } catch (error) {
        console.error('Error updating user:', error);
        return Response.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

// DELETE /api/chapters/admin/users/[id] — Deactivate user
export async function DELETE(request, { params }) {
    const auth = await verifyAdminWithRole(request);
    if (!auth || auth.role !== 'super_admin') return unauthorizedResponse();

    try {
        await dbConnect();
        const { id } = await params;
        const user = await Admin.findById(id);
        if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

        user.isActive = !user.isActive;
        await user.save();

        return Response.json({ message: user.isActive ? 'User activated' : 'User deactivated' });
    } catch (error) {
        return Response.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
