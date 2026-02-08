import mongoose from 'mongoose';

const TargetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a target name.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Target || mongoose.model('Target', TargetSchema);
