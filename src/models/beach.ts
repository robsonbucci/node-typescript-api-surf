import mongoose, { Document, Model } from 'mongoose';

export enum BeachPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N',
}

export interface IBeach {
  _id?: string;
  name: string;
  lat: number;
  lng: number;
  position: BeachPosition;
}

const schema = new mongoose.Schema<IBeach>(
  {
    lat: { type: Number, require: true },
    lng: { type: Number, require: true },
    name: { type: String, require: true },
    position: { type: String, require: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// interface IBeachModel extends Omit<IBeach, '_id'>, Document {}
export const Beach: Model<IBeach> = mongoose.model('Beach', schema);
