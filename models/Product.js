import Mongoose from 'mongoose';
import { useVirtualId } from '../database/database.js';
import dayjs from 'dayjs';

const offset = 1000 * 60 * 60 * 9
const koreaNow = new Date((new Date()).getTime() + offset)
const registerDate = koreaNow.toISOString().replace("T", " ").split('.')[0]

const productSchema = new Mongoose.Schema({
  productName: { type: String, required: true },
  category: {
    mainCategory: { type: String, required: true },
    subCategory: { type: String, required: true }
  },
  returnAvailability: { type: Number, required: true, default: 1 }, //1 반납 필, 0 반납 안해도됨, 프런트단에서 확인하여 0인경우 validation을 하자
  rentalAvailability: { type: Number, required: true, default: 1 }, //1 대여 가능, 대여 불가, 프런트단에서 확인하여 1인경우 아예 대여 버튼을 없애자
  productCode: { type: String, default: "000-000" }, // 제품코드, unique
  quantity: { type: Number, default: 1 },// 수량이 0 인경우 대여 불가능하게 방법1. 프런트에서 대여버튼없애기 2. 백에서 확인수 ㄱㄷ셔구
  //대여이력 저장 하는 곳 , 물품별 대여이력출력, 그리고 대여현황(리스트중애서 반납날짜가 없는 것 or 00-00-00인것 만 뽑아내면 됨) 출력시 사용
  //추후 배열안에 틀어갈 수 있는 커스텀 클래스 사용 할 수 있는지 확인 해 볼 것!!
  lended: { type: Array, default: [] },
  registerDate: {type:String, default: registerDate}

});

useVirtualId(productSchema);
const Product = Mongoose.model('Product', productSchema);



export async function findByProductCode(productCode) {
  return Product.findOne({ productCode });
}

export async function createProduct(product) {
  return new Product(product).save().then((data) => data.id);
}

export async function updateByProduct(product) {
  return new Product(product).save().then((data) => data.id);
}

export async function getAll(){
  return Product.find({})
}

export async function findByProductName(productName) {
  return Product.find({ productName });
}

export async function deleteByProductCode(productCode){
  return Product.deleteMany({productCode})
}
