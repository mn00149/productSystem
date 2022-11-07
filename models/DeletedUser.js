import Mongoose from 'mongoose';
import { useVirtualId } from '../database/database.js';

const deletedUserSchema = new Mongoose.Schema({
    username: { type: String },
    employeeNumber: Number, // 사번, unique
    lending: {type: Array, default: []},
  },{timestamps:true});

useVirtualId(deletedUserSchema);
const DeletedUser = Mongoose.model('DeletedUser', deletedUserSchema);

export async function create(deletedUser) {
    return new DeletedUser({
      username: deletedUser.username,
      employeeNumber: deletedUser.employeeNumber,
      lending: deletedUser.lending
    }).save().then((data) => data.id);
}