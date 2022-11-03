import express from 'express';
import * as productRepository from '../models/Product.js';
import * as categoryRepository from '../models/Category.js';
import * as userRepository from '../models/User.js';
import { isAuth } from '../middleware/auth.js';
import * as util from '../middleware/util.js'

const router = express.Router();

router.get('/', async (req, res) => {
  res.status(201).send('GET: /products');
});
//물품등록 폼 화면 호출 api
router.get('/register', async (req, res) => {
  res.render('productRegister')
})
//물품등록 api
router.post('/register', async (req, res) => {
  const { mainCategory, subCategory, productName, returnAvailability, rentalAvailability, productCode, quantity } = req.body
  const registerDate = util.getDate()
  // 프런트단에서도 대분류 소분류 기본값주도록 필요시 설정
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
  const newProduct = { productName, returnAvailability, rentalAvailability, productCode, quantity, category, registerDate }
  await productRepository.createProduct(newProduct)

  res.status(201).json({ message: "물품등록 성공" });
});

// 물품 관리 페이지 렌더링
router.get('/manage', async (req, res) => {
  res.render('productManage')
})

//물품 리스트 불러오는 api
router.get('/getAll', async (req, res) => {
  const products = await productRepository.getAll()
  if (!products) { return res.status(401).json({ message: '현제 등록된 물품이 없습니다' }) }
  return res.status(201).json(products)
})
// 물품대여 폼
router.get('/rentalForm/:productCode', async(req, res) => {
  const productCode = req.params.productCode
  const product = await productRepository.findByProductCode(productCode)

  return res.render('rentalForm', {product})
})
// 물품 대여 api
router.post('/rent', isAuth, async (req, res) => {
  const user = req.user
  let { productCode, duedate, issuedate, reason } = req.body
  productCode = productCode.trim()

  const isLending = user.lending.find((product) => product.productCode == productCode)
  if (isLending) {
    return res.status(409).json({ message: "이미 대여중 입니다, 반납후 대여 가능 합니다" })
  }
  let product = await productRepository.findByProductCode(productCode)
  const product_id = product._id.toHexString()
  if(product.returnAvailability == 1){
    if(!duedate || !issuedate || new Date(issuedate) > new Date(duedate)) return res.status(409).json({message:"대여시간 설정이 잘못되었습니다"})
  }
  issuedate = issuedate.replace("T", " ")
  duedate = duedate.replace("T", " ")
  const newQuantity = product.quantity - 1
  if (newQuantity < 0) { return res.status(409).json({ message: "대여가능한 수량이 없습니다" }) }
  const lending = {
    product_id,
    mainCategory: product.category.mainCategory,
    subCategory: product.category.subCategory,
    productName: product.productName,
    productCode,
    duedate,
    issuedate
  }
  const lended = {
    employeeNumber: user.employeeNumber,
    username: user.username,
    reason,
    issuedate,
    duedate
  }
  user.lending.push(lending)
  product.lended.push(lended)
  product.quantity = newQuantity
  await userRepository.updateUserbyUser(user)
  await productRepository.updateByProduct(product)
  return res.status(200).json({ message: '대여 성공' })
})

//물품명으로 물품 검색
router.get('/search/productName/:productName', async (req, res) => {
  const productName = req.params.productName
  const products = await productRepository.getAll()
  const searchProducts = products.filter((product) => product.productName.includes(productName))
  return res.status(200).json(searchProducts)
})

//대여자로 물품검색
router.get('/search/username/:username', async (req, res) => {
  const username = req.params.username
  const products = await productRepository.getAll()
  const searchProducts = products.map((product) => {
    for(let i=0; i<product.lended.length; i++){
      if(product.lended[i].username.includes(username))return product 
    }
  }).filter((product) => product)
  console.log(searchProducts)
  return res.status(200).json(searchProducts)
})

//물품별 대여자 목록
router.get('/usersInf/:productCode', async (req, res) => {
  const productCode = req.params.productCode
  const product = await productRepository.findByProductCode(productCode)
  const lendedUsers = product.lended
  if(!lendedUsers.length) return res.render('error/noContent')
  return res.render('product/productUser', {lendedUsers})
})
// 물품반납 API
router.put('/:productCode', isAuth, async (req, res) => {
  const { productCode } = req.params
  const returndate = util.getDate()
  let user = req.user
  let product = await productRepository.findByProductCode(productCode)

  user.lendingList = user.lendingList.filter((lendingproductCode) => lendingproductCode != productCode)
  user.lending = user.lending.filter((lendingproduct) => lendingproduct.productCode != productCode)

  const updateLended = product.lended.map((record) => {
    //물품 여러개일 때 확인!!
    if (!record.returndate && record.username == user.username) {
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

//물품 편집화면 출력
router.get('/edit/:productCode', async (req, res) => {
  const productCode = req.params.productCode
  const product = await productRepository.findByProductCode(productCode)
  res.render('product/productEdit', {product})
})
//물품 편집 api
router.post('/edit', async (req, res) => {
  const {oproductCode, mainCategory, subCategory, productName, returnAvailability, rentalAvailability, productCode, quantity } = req.body
  console.log(mainCategory)
  const registerDate = util.getDate()
  // 프런트단에서도 대분류 소분류 기본값주도록 필요시 설정
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
  const findProduct = await productRepository.findByProductCode(oproductCode)
  const product_id = findProduct._id.toHexString()
  if (!findProduct) {
    return res.status(409).json({ message: `수정할 물품이 없습니다 관리자에게 문의 바랍니다` })
  }
  const updateProduct = {productName, returnAvailability, rentalAvailability, productCode, quantity, category, registerDate }
  await productRepository.updateProduct(findProduct._id, updateProduct)
  await userRepository.updateLendingByProduct_id(product_id, {mainCategory, subCategory, productCode, productName})
  res.status(201).json({ message: "물품수정 성공" });
});

//물품 삭제 api
router.post('/delete', async (req, res) => {
  const { productCode } = req.body
  console.log(productCode)
  await productRepository.deleteByProductCode(productCode)
  res.status(201).json({ message: '삭제되었습니다' });
});

export default router;
