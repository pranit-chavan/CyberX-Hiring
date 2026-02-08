import dbConnect from '../../../../lib/mongodb';
import Note from '../../../../models/Note';
import { processTerminalOutput } from '../../../../lib/gemini';

export async function GET(req) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get('targetId');

    try {
        const query = targetId ? { targetId } : {};
        const notes = await Note.find(query).sort({ createdAt: -1 });
        return Response.json({ success: true, data: notes });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 400 });
    }
}

import { put } from '@vercel/blob';

export async function POST(req) {
    await dbConnect();

    try {
        const formData = await req.formData();
        const content = formData.get('content');
        const targetId = formData.get('targetId');
        const file = formData.get('file');

        if (!content || !targetId) {
            return Response.json({ success: false, error: 'Content and Target ID are required' }, { status: 400 });
        }

        let imageUrl = null;
        let imageAnalysis = null;
        let imageBuffer = null;
        let mimeType = null;

        if (file && file.size > 0) {
            // Upload to Vercel Blob
            const blob = await put(file.name, file, { access: 'public' });
            imageUrl = blob.url;

            // Prepare for Gemini
            imageBuffer = Buffer.from(await file.arrayBuffer());
            mimeType = file.type;
        }

        // Process with Gemini AI
        const apiKey = req.headers.get('x-gemini-api-key');
        const modelName = req.headers.get('x-gemini-model') || 'gemini-2.0-flash';
        const aiResult = await processTerminalOutput(content, imageBuffer, mimeType, apiKey, modelName);

        // Create Note
        const note = await Note.create({
            targetId,
            content,
            title: aiResult.title || 'New Note',
            summary: aiResult.summary || 'No summary available.',
            imageUrl,
            imageAnalysis: aiResult.imageAnalysis,
            isAiProcessed: true,
        });

        return Response.json({ success: true, data: note }, { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/notes:", error);
        return Response.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PUT(req) {
    await dbConnect();

    try {
        const formData = await req.formData();
        const noteId = formData.get('noteId');
        const content = formData.get('content');
        const file = formData.get('file');

        if (!noteId || !content) {
            return Response.json({ success: false, error: 'Note ID and Content are required' }, { status: 400 });
        }

        let imageUrl = undefined; // Undefined means don't update
        let imageAnalysis = undefined;
        let imageBuffer = null;
        let mimeType = null;

        if (file && file.size > 0) {
            // Upload to Vercel Blob
            const blob = await put(file.name, file, { access: 'public' });
            imageUrl = blob.url;

            // Prepare for Gemini
            imageBuffer = Buffer.from(await file.arrayBuffer());
            mimeType = file.type;
        }

        // Process with Gemini AI for new title and summary
        const apiKey = req.headers.get('x-gemini-api-key');
        const modelName = req.headers.get('x-gemini-model') || 'gemini-2.0-flash';

        const aiResult = await processTerminalOutput(content, imageBuffer, mimeType, apiKey, modelName);

        const updateData = {
            content,
            title: aiResult.title || 'Updated Note',
            summary: aiResult.summary || 'Summary not available.',
            isAiProcessed: true,
            ...(aiResult.imageAnalysis && { imageAnalysis: aiResult.imageAnalysis }),
        };

        if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }

        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            updateData,
            { new: true }
        );

        if (!updatedNote) {
            return Response.json({ success: false, error: 'Note not found' }, { status: 404 });
        }

        return Response.json({ success: true, data: updatedNote });
    } catch (error) {
        console.error("Error in PUT /api/notes:", error);
        return Response.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('noteId');

    if (!noteId) {
        return Response.json({ success: false, error: 'Note ID is required' }, { status: 400 });
    }

    try {
        const deletedNote = await Note.findByIdAndDelete(noteId);

        if (!deletedNote) {
            return Response.json({ success: false, error: 'Note not found' }, { status: 404 });
        }

        return Response.json({ success: true, data: deletedNote });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 400 });
    }
}
