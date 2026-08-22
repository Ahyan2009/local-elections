import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: 'Pending' },
    cnic: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: 'Pending' },
    district: { type: String, default: 'Pending' },
    tehsil: { type: String, default: 'Pending' },
    unionCouncil: { type: String, default: 'Pending' },
    electionSymbol: { type: String, default: 'Pending' },
    symbolIcon: { type: String, default: null },
    image: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending_approval', 'pending', 'approved', 'rejected'],
      default: 'pending_approval',
    },
    otpCode: { type: String, default: null },
    isOtpVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Candidate', candidateSchema);