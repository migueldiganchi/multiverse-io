import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPurchase extends Document {
  _id: Types.ObjectId;
  buyer: Types.ObjectId;
  buyerUsername: string;
  seller: Types.ObjectId;
  sellerUsername: string;
  story: Types.ObjectId;
  storyTitle: string;
  storySlug: string;
  versionId: string;
  versionTitle: string;
  amount: number;
  platformFee: number;
  sellerEarnings: number;
  stripePaymentIntentId: string;
  status: 'pending' | 'completed' | 'refunded';
  createdAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    buyerUsername: { type: String, required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sellerUsername: { type: String, required: true },
    story: { type: Schema.Types.ObjectId, ref: 'Story', required: true },
    storyTitle: { type: String, required: true },
    storySlug: { type: String, required: true },
    versionId: { type: String, required: true },
    versionTitle: { type: String, required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    sellerEarnings: { type: Number, required: true },
    stripePaymentIntentId: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);
