import express from 'express';
import * as productRepository from '../models/Product.js';
import * as categoryRepository from '../models/Category.js';
import * as userRepository from '../models/User.js';

import { isAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  res.status(201).send('GET: /products');
});
//물품등록 폼 화면 호출 api
router.get('/register', async(req, res) => {
  res.render('productRegister')
})
//물품등록 api
router.post('/register', async (req, res) => {
  const { mainCategory, subCategory, productName, returnAvailability, rentalAvailability, productCode, quantity } = req.body
  // 프런트단에서도 대분류 소분류 기본값주도록 설정 validation 필요
  if (!mainCategory) { return res.status(401).json({ message: "Main Category reqiured" }) }
  if (!subCategory) { return res.status(401).json({ message: "Sub Category reqiured" }) }
  const category = { mainCategory, subCategory }
  const findMainCategory = await categoryRepository.findByMainCategory(mainCategory)

  if (findMainCategory) {
    await categoryRepository.crateSubCategory(mainCategory, subCategory)
  } else {
    await categoryRepository.createCategory(category)
  }
  // body 값 숫자 제대로 받는 지 확인 할 것
  const findProduct = await productRepository.findByProductCode(productCode)
  if (findProduct) {
    return res.status(409).json({ message: productCode + ` already exists` })
  }
  const newProduct = { productName, returnAvailability, rentalAvailability, productCode, quantity, category }
  await productRepository.createProduct(newProduct)

  res.status(201).json({ message: "물품등록 성공" });
});
// 물품 대여 api
router.post('/rent',isAuth, async (req, res) => {
  const user = req.user
  const { mainCategory, subCategory, productName, productCode, duedate, issuedate } = req.body
  const isLending = user.lendingList.find((lendingProductCode) => lendingProductCode == productCode)
  if (isLending) {
    return res.status(409).json({ message: "이미 대여중 입니다, 반납후 대여 가능 합니다" })
  }
  let product = await productRepository.findByProductCode(productCode)
  const newQuantity = product.quantity - 1
  if (newQuantity < 0) { return res.status(409).json({ message: "대여가능한 수량이 없습니다" }) }
  const lending = { mainCategory, subCategory, productName, productCode, duedate, issuedate }
  const lended = {
    employeeNumber: user.employeeNumber,
    username: user.username,
    issuedate,
    duedate
  }
  user.lending.push(lending)
  user.lendingList.push(productCode)
  product.lended.push(lended)
  product.quantity = newQuantity
  await userRepository.updateUserbyUser(user)
  await productRepository.updateByProduct(product)

  return res.status(200).json({ message: '대여 성공' })

})
// 물품반납 API
router.put('/:productCode', isAuth, async (req, res) => {
  const {productCode} = req.params
  const returndate = new Date()
  let user = req.user
  let product = await productRepository.findByProductCode(productCode)
  
  user.lendingList = user.lendingList.filter((lendingproductCode) => lendingproductCode != productCode)
  user.lending = user.lending.filter((lendingproduct) => lendingproduct.productCode != productCode)

  const updateLended = product.lended.map((record) => {
    //물품 여러개일 때 확인!!
    if(!record.returndate && record.username == user.username){
      record.returndate = returndate
      return record
    }
    return record
  })

  product.quantity += 1
  product.lended = updateLended
  
  await productRepository.updateByProduct(product)
  await userRepository.updateUserbyUser(user)
  

  res.status(201).send('반닙성공');
});

router.delete('/:id', async (req, res) => {
  res.status(201).send('DELETE: /products/:id');
});

export default router;
