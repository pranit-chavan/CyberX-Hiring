import { jwtVerify } from 'jose';
import { JWT_SECRET, COOKIE_NAME } from './auth-constants';

export async function verifyAdmin(request) {
    try {
        const token = request.cookies.get(COOKIE_NAME)?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return false;
        }

        const secret = new TextEncoder().encode(JWT_SECRET);
        await jwtVerify(token, secret);
        return true;
    } catch (error) {
        return false;
    }
}

export async function verifyAdminWithRole(request) {
    try {
        const token = request.cookies.get(COOKIE_NAME)?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return null;
        }

        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return {
            adminId: payload.adminId,
            username: payload.username,
            role: payload.role || 'super_admin',
            chapterId: payload.chapterId || null
        };
    } catch (error) {
        return null;
    }
}

export function unauthorizedResponse() {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
