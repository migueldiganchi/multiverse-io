import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  displayName: string;
  bio: string;
  avatar: string;
  role: 'reader' | 'writer' | 'admin';
  plan: 'free' | 'reader' | 'writer';
  isVerified: boolean;
  isActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planExpiresAt?: Date;
  earnings: number;
  storiesCount: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    displayName: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['reader', 'writer', 'admin'], default: 'reader' },
    plan: { type: String, enum: ['free', 'reader', 'writer'], default: 'free' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    planExpiresAt: { type: Date },
    earnings: { type: Number, default: 0 },
    storiesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

async function hashPassword(this: IUser) {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
}

UserSchema.pre('save', hashPassword);

async function comparePassword(this: IUser, password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
}

UserSchema.methods.comparePassword = comparePassword;

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
