import mongoose, { Schema, Document } from 'mongoose';

export interface IConsumer extends Document {
  fullName: string;
  phone: string;
  city: string;
  password?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsumerSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String },
  },
  { timestamps: true, strict: false }
);

if (mongoose.models.Consumer) {
  delete mongoose.models.Consumer;
}

export const ConsumerModel = mongoose.model<IConsumer>('Consumer', ConsumerSchema);
