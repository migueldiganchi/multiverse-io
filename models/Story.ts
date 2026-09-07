import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVersion {
  _id: Types.ObjectId;
  title: string;
  content: string;
  summary: string;
  isFree: boolean;
  price: number;
  purchasedBy: string[];
  viewCount: number;
  likeCount: number;
  mediaType: 'text' | 'audio' | 'video';
  mediaUrl?: string;
  nodeType: 'chapter' | 'alternate';
  parentVersionId?: string;
  choices: { label: string; targetVersionId: string }[];
  createdAt: Date;
}

export interface IStory extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  genre: string[];
  tags: string[];
  author: Types.ObjectId;
  authorUsername: string;
  originStory?: Types.ObjectId;
  originSlug?: string;
  originType?: 'original' | 'clone' | 'continuation';
  versions: IVersion[];
  isPublished: boolean;
  isFeatured: boolean;
  basePrice: number;
  totalVersions: number;
  freeVersions: number;
  paidVersions: number;
  totalViews: number;
  totalLikes: number;
  totalPurchases: number;
  totalEarnings: number;
  aiGenerated: boolean;
  language: string;
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const VersionSchema = new Schema<IVersion>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    summary: { type: String, default: '' },
    isFree: { type: Boolean, default: true },
    price: { type: Number, default: 0, min: 0 },
    purchasedBy: [{ type: String }],
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    mediaType: { type: String, enum: ['text', 'audio', 'video'], default: 'text' },
    mediaUrl: { type: String, default: '' },
    nodeType: { type: String, enum: ['chapter', 'alternate'], default: 'chapter' },
    parentVersionId: { type: String, default: '' },
    choices: [{
      label: { type: String, trim: true },
      targetVersionId: { type: String },
    }],
  },
  { timestamps: true }
);

const StorySchema = new Schema<IStory>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true, maxlength: 1000 },
    coverImage: { type: String, default: '' },
    genre: [{ type: String }],
    tags: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorUsername: { type: String, required: true },
    originStory: { type: Schema.Types.ObjectId, ref: 'Story' },
    originSlug: { type: String, default: '' },
    originType: { type: String, enum: ['original', 'clone', 'continuation'], default: 'original' },
    versions: [VersionSchema],
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    basePrice: { type: Number, default: 0 },
    totalVersions: { type: Number, default: 0 },
    freeVersions: { type: Number, default: 0 },
    paidVersions: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    aiGenerated: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    readingTime: { type: Number, default: 5 },
  },
  { timestamps: true }
);

StorySchema.index({ slug: 1 });
StorySchema.index({ author: 1 });
StorySchema.index({ isPublished: 1 });
StorySchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Story || mongoose.model<IStory>('Story', StorySchema);
