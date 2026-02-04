import dbConnect from '../../../../lib/mongodb';
import Application from '../../../../models/Application';
import { put } from '@vercel/blob';
import { verifyAdmin, unauthorizedResponse } from '../../../../lib/auth-utils';

// Simple in-memory rate limiting store
const rateLimitStore = new Map();

// Rate limiting: 1 submission per IP per 5 minutes
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxRequests = 1;

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const record = rateLimitStore.get(ip);

  if (now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 60000); // Clean every minute

export async function POST(request) {
  try {
    await dbConnect();

    const formData = await request.formData();

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Rate limiting check
    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Extract form data
    const data = {};
    const resumeFile = formData.get('resumeFile');

    // Handle all form fields
    for (const [key, value] of formData.entries()) {
      if (key === 'resumeFile') continue;
      if (key.endsWith('[]')) {
        // Handle array fields
        const arrayKey = key.slice(0, -2);
        if (!data[arrayKey]) data[arrayKey] = [];
        data[arrayKey].push(value);
      } else if (key.startsWith('domainLevels[')) {
        // Parse nested keys: domainLevels[Web Security]
        const match = key.match(/domainLevels\[(.*?)\]/);
        if (match) {
          const domain = match[1];
          if (!data.domainLevels) data.domainLevels = {};
          data.domainLevels[domain] = value;
        }
      } else {
        data[key] = value;
      }
    }

    // Honeypot check - reject if hidden field is filled
    if (data.companyWebsite && data.companyWebsite.trim() !== '') {
      // Silent rejection for bots
      return Response.json(
        { error: 'Invalid submission' },
        { status: 400 }
      );
    }

    // Remove honeypot field from data
    delete data.companyWebsite;

    // Check if application with this email already exists
    const existingApplication = await Application.findOne({
      email: data.email.toLowerCase()
    });

    if (existingApplication) {
      return Response.json(
        { error: 'An application with this email already exists' },
        { status: 400 }
      );
    }

    // Handle resume file upload
    let resumePath = null;
    if (resumeFile && resumeFile.size > 0) {
      /* 
         VERCEL BLOB INTEGRATION 
         Replaces local fs.writeFile which doesn't work in serverless
      */
      const timestamp = Date.now();
      // Sanitize email for filename
      const safeEmail = data.email.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `resumes/${safeEmail}_${timestamp}.pdf`;

      // Upload to Vercel Blob
      const blob = await put(filename, resumeFile, {
        access: 'public',
      });

      resumePath = blob.url; // Store the public URL
    }

    // Map new form fields directly to schema
    const processedData = {
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      whatsappNumber: data.whatsappNumber,
      linkedinProfile: data.linkedinProfile || '',

      statusDescription: data.statusDescription,
      organizationName: data.organizationName || '',

      domainInterests: data.domainInterests || [],
      domainLevels: data.domainLevels || {},

      platformsUsed: data.platformsUsed || [],
      certificationDetails: data.certificationDetails || '',
      platformProfileLink: data.platformProfileLink || '',
      ctfParticipation: data.ctfParticipation || '',

      whyJoinCyberX: data.whyJoinCyberX || '',
      declarationAccepted: data.declarationAccepted === 'true' || data.declarationAccepted === true,

      resumePath: resumePath || ''
    };

    const application = new Application(processedData);
    await application.save();

    // Send data to webhook (excluding resume) - non-blocking
    try {
      const webhookData = {
        applicationId: application._id.toString(),
        fullName: processedData.fullName,
        email: processedData.email,
        whatsappNumber: processedData.whatsappNumber,
        linkedinProfile: processedData.linkedinProfile,
        statusDescription: processedData.statusDescription,
        organizationName: processedData.organizationName,
        domainInterests: processedData.domainInterests,
        domainLevels: processedData.domainLevels,
        platformsUsed: processedData.platformsUsed,
        certificationDetails: processedData.certificationDetails,
        platformProfileLink: processedData.platformProfileLink,
        ctfParticipation: processedData.ctfParticipation,
        whyJoinCyberX: processedData.whyJoinCyberX,
        submittedAt: application.submittedAt,
        status: application.status
      };

      const webhookUrl = process.env.WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookData)
        });
      }
    } catch (webhookError) {
      console.error('Webhook preparation error:', webhookError);
    }

    return Response.json(
      {
        message: 'Application submitted successfully',
        applicationId: application._id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Application submission error:', error);

    // Handle duplicate key error (Mongoose code 11000)
    if (error.code === 11000) {
      return Response.json(
        { error: 'Application with this Email or WhatsApp number already exists.' },
        { status: 400 }
      );
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return Response.json(
        { error: `Validation Error: ${messages.join(', ')}` },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  if (!await verifyAdmin(request)) return unauthorizedResponse();

  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build filter object
    const filter = {};
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { whatsappNumber: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } },
        { statusDescription: { $regex: search, $options: 'i' } }
      ];
    }

    const applications = await Application.find(filter)
      .sort({ submittedAt: -1 });

    const total = applications.length;

    return Response.json({
      applications,
      total
    });
  } catch (error) {
    console.error('Fetch applications error:', error);
    return Response.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
