import Mongoose from 'mongoose';
import { useVirtualId } from '../database/database.js';

const userSchema = new Mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },//unique
  password: { type: String, required: true },
  department: String, // 부서명
  employeeNumber: Number, // 사번, unique
  role: { type: String, default: 'nomal' }, //직책,
  right: { type: String, default: 'open' }, //권한 (등록, 열람, 편집, 대여)
  lending: {type: Array, default: []},
  lendingList: {type: Array, default: []} // 대여한 물품코드를 저장 한 뒤 대여시 api 에서 확인 하여 있으면 대여 못하게 막기
},{timestamps:true});

useVirtualId(userSchema);
const User = Mongoose.model('User', userSchema);

export async function findByUsername(username) {
  return User.findOne({ username });
}

export async function findById(id) {
  return User.findById(id);
}

export async function createUser(user) {
  return new User(user).save().then((data) => data.id);
}

export async function findByEmail(email) {
  return User.findOne({ email });
}

export async function findByEmployeeNumber(employeeNumber) {
  return User.findOne({ employeeNumber });
}

export async function updateUserbyUser(user) {
  return new User(user).save().then((data) => data.id);
}

export async function getAll() {
  return User.find({});
}