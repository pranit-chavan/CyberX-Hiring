import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  whatsappNumber: {
    type: String,
    required: true,
    trim: true
  },
  linkedinProfile: {
    type: String,
    trim: true
  },

  // Current Status & Education
  statusDescription: {
    type: String,
    required: true,
    trim: true,
    comment: 'What describes me best'
  },
  organizationName: {
    type: String,
    trim: true,
    comment: 'College name or organization name'
  },

  // Domain Interests
  domainInterests: [{
    type: String,
    trim: true
  }],
  domainLevels: {
    type: Map,
    of: String,
    comment: 'Domain expertise levels as key-value pairs e.g. {"Web Security": "Intermediate"}'
  },

  // Practical Exposure
  platformsUsed: [{
    type: String,
    trim: true
  }],
  certificationDetails: {
    type: String,
    trim: true
  },
  platformProfileLink: {
    type: String,
    trim: true,
    comment: 'TryHackMe/HackTheBox profile link'
  },
  ctfParticipation: {
    type: String,
    trim: true
  },

  // Motivation & Declaration
  whyJoinCyberX: {
    type: String,
    required: true,
    trim: true
  },
  declarationAccepted: {
    type: Boolean,
    required: true,
    default: false
  },

  // Resume file path (Legacy/Optional now as it was removed from form but kept for backend compatibility if needed or re-added)
  resumePath: {
    type: String,
    trim: true
  },

  // Admin Fields
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'selected', 'rejected', 'approved'],
    default: 'pending'
  },
  adminRemarks: {
    type: String,
    trim: true
  },
  feedback: {
    type: String,
    trim: true
  },

  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Performance indexes
ApplicationSchema.index({ email: 1 }, { unique: true });
ApplicationSchema.index({ whatsappNumber: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ submittedAt: -1 });
ApplicationSchema.index({ organizationName: 1 });
ApplicationSchema.index({ statusDescription: 1 });

// Text search index
ApplicationSchema.index({
  fullName: 'text',
  email: 'text',
  whatsappNumber: 'text',
  organizationName: 'text',
  statusDescription: 'text',
  whyJoinCyberX: 'text',
  certificationDetails: 'text'
});

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
