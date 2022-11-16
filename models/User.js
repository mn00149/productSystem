import Mongoose from 'mongoose';
import { useVirtualId } from '../database/database.js';
import * as deletedUserRepository from './DeletedUser.js'


const userSchema = new Mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },//unique
  password: { type: String, required: true },
  department: String, // 부서명
  employeeNumber: Number, // 사번, unique
  role: { type: String, default: 'nomal' }, //직책,
  right: { type: Array, default: ['open'] }, //권한 (등록, 열람, 편집, 대여)
  lending: { type: Array, default: [] },
}, { timestamps: true });

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
// 추방 당하지 않은 유저들만 불러 올 것
export async function getAll() {
  return User.find({});
}

export async function updateLendingByProduct_id(product_id, data) {

  return User.update({ 'lending.product_id': product_id },
    {
      '$set': {
        'lending.$.mainCategory': data.mainCategory,
        'lending.$.subCategory': data.subCategory,
        'lending.$.productCode': data.productCode,
        'lending.$.productName': data.productName
      }
    }
  )
}

export async function deleteByEmployeeNumber(employeeNumber) {
  const deletedUser = await User.findOneAndDelete({ employeeNumber })
  return await deletedUserRepository.create(deletedUser)
}

// export async function deleteByEmployeeNumber(employeeNumber) {
//   const deletedUser = await User.findOneAndUpdate({ employeeNumber }, {isDeleted: 1})
//   return await deletedUserRepository.create(deletedUser)
// }


