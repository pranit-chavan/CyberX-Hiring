import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, default: '' },
    location: { type: String, default: '' },
    type: { type: String, default: 'Event' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['upcoming', 'past'], default: 'upcoming' }
}, { _id: true });

const SponsorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, default: '' },
    initial: { type: String, default: '' },
    color: { type: String, default: '#E6C200' }
}, { _id: true });

const ChapterSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'coming-soon'],
        default: 'coming-soon'
    },
    lead: {
        type: String,
        default: null
    },
    members: {
        type: String,
        default: null
    },
    events: {
        type: Number,
        default: null
    },
    description: {
        type: String,
        required: true
    },
    founded: {
        type: String,
        default: null
    },
    linkedin: {
        type: String,
        default: null
    },
    instagram: {
        type: String,
        default: null
    },
    highlights: {
        type: [String],
        default: []
    },
    eventsList: {
        type: [EventSchema],
        default: []
    },
    sponsors: {
        type: [SponsorSchema],
        default: []
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema);
