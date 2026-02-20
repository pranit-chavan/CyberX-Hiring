import dbConnect from '../../../../../../lib/mongodb';
import Admin from '../../../../../../models/Admin';
import Chapter from '../../../../../../models/Chapter';
import { verifyAdminWithRole, unauthorizedResponse } from '../../../../../../lib/auth-utils';
import bcrypt from 'bcryptjs';

function generatePassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// GET /api/chapters/admin/users — List all chapter-related users
export async function GET(request) {
    const auth = await verifyAdminWithRole(request);
    if (!auth || auth.role !== 'super_admin') return unauthorizedResponse();

    try {
        await dbConnect();
        const users = await Admin.find({})
            .select('-password')
            .populate('chapterId', 'city state')
            .sort({ createdAt: -1 });

        return Response.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

// POST /api/chapters/admin/users — Create a new chapter user with generated password
export async function POST(request) {
    const auth = await verifyAdminWithRole(request);
    if (!auth || auth.role !== 'super_admin') return unauthorizedResponse();

    try {
        await dbConnect();
        const { email, username, role, chapterId } = await request.json();

        if (!email || !username) {
            return Response.json({ error: 'Email and username are required' }, { status: 400 });
        }

        // Check if user already exists
        const existing = await Admin.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return Response.json({ error: 'User with this email or username already exists' }, { status: 409 });
        }

        // Validate chapterId if role is chapter_lead
        if (role === 'chapter_lead' && chapterId) {
            const chapter = await Chapter.findById(chapterId);
            if (!chapter) {
                return Response.json({ error: 'Chapter not found' }, { status: 404 });
            }
        }

        const generatedPassword = generatePassword();

        const user = await Admin.create({
            email,
            username,
            password: generatedPassword,
            role: role || 'chapter_lead',
            chapterId: chapterId || null
        });

        return Response.json({
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                chapterId: user.chapterId
            },
            generatedPassword,
            message: 'User created successfully. Share the password securely.'
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return Response.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
