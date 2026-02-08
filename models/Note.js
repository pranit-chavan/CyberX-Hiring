import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Target',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: false,
    },
    imageAnalysis: {
        type: String,
        required: false,
    },
    isAiProcessed: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
