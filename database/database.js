import Mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config()
//import { config } from '../config.js';
// make secure!! by making config file
const mongoURI = process.env.MONGO_URL
export async function connectDB() {
  return Mongoose.connect(mongoURI);
}

export function useVirtualId(schema) {
  // _id -> id 컬랙션의 _id(object type) 을 콘솔과 json으로
  // 읽을 수 있도록 가상의 id 생성 하는 함수
  schema.virtual('id').get(function () {
    return this._id.toString();
  });
  schema.set('toJSON', { virtuals: true });
  schema.set('toOject', { virtuals: true });
}

