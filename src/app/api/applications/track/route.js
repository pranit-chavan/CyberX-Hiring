import dbConnect from '../../../../../lib/mongodb';
import Application from '../../../../../models/Application';

// Simple in-memory rate limiting for public track endpoint
const trackLimiter = new Map();

function checkTrackRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10; // 10 checks per 15 min per IP

  if (!trackLimiter.has(ip)) {
    trackLimiter.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const record = trackLimiter.get(ip);
  if (now > record.resetTime) {
    trackLimiter.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) return false;

  record.count++;
  return true;
}

// Cleanup limiter
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of trackLimiter.entries()) {
    if (now > record.resetTime) trackLimiter.delete(ip);
  }
}, 60 * 60 * 1000);

export async function POST(request) {
  try {
    await dbConnect();

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkTrackRateLimit(ip)) {
      return Response.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { search } = await request.json();

    if (!search || search.trim().length < 3) {
      return Response.json(
        { error: 'Please enter a valid email or phone number' },
        { status: 400 }
      );
    }

    const term = search.toLowerCase().trim();

    // Find application by Email OR WhatsApp Number
    const application = await Application.findOne({
      $or: [
        { email: term },
        { whatsappNumber: term }
      ]
    }).select('fullName status updatedAt submittedAt statusDescription organizationName');

    if (!application) {
      return Response.json(
        { error: 'No application found with these details.' },
        { status: 404 }
      );
    }

    return Response.json({
      application: {
        fullName: application.fullName,
        status: application.status,
        lastUpdated: application.updatedAt || application.submittedAt,
        submittedAt: application.submittedAt,
        // Optional: return generic status info without sensitive data
        organizationName: application.organizationName,
        statusDescription: application.statusDescription
      }
    });

  } catch (error) {
    console.error('Track API error:', error);
    return Response.json(
      { error: 'Unable to check status. Please try again.' },
      { status: 500 }
    );
  }
}
