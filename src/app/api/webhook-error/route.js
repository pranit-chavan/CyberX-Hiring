import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();

        const webhookUrl = process.env.WEBHOOK_URL;

        if (!webhookUrl) {
            console.error('WEBHOOK_URL not configured');
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
        }

        // Send error data to webhook
        const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'form_submission_error',
                error: body.error,
                fullName: body.fullName,
                email: body.email,
                whatsappNumber: body.whatsappNumber,
                timestamp: body.timestamp
            })
        });

        if (!webhookResponse.ok) {
            throw new Error('Webhook request failed');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Failed to send to webhook' }, { status: 500 });
    }
}
