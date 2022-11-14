import express from 'express';
import ExcelJS from 'exceljs';
import fs from 'fs';
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
  const user = req.user
  res.render('productRegister', {user})
})
//물품등록 api
router.post('/register', async (req, res) => {
  const { mainCategory, subCategory, productName, returnAvailability, rentalAvailability, productCode, quantity } = req.body
  const registerDate = util.getDate()
  // 프런트단에서도 대분류 소분류 기본값주도록 필요시 설정
  if (!mainCategory) { return res.status(401).json({ message: "Main Category reqiured" }) }
  if (!subCategory) { return res.status(401).json({ message: "Sub Category reqiured" }) }
  if(!productCode){return res.status(401).json({message: "물품번호를 입력 바랍니다"})}
  const category = { mainCategory, subCategory }
  await categoryRepository.crateSubCategory(mainCategory, subCategory)
  // body 값 숫자 제대로 받는 지 확인 할 것
  const findProduct = await productRepository.findByProductCode(productCode)
  if (findProduct) {
    return res.status(409).json({ message: productCode + ` already exists` })
  }
  const newProduct = { productName, returnAvailability, rentalAvailability, productCode, quantity, category, registerDate }
  await productRepository.createProduct(newProduct)

  res.status(201).json({ message: "물품등록 성공" });
});

//엑셀로 물품등록
router.post('/register/excel', async (req, res) => {
  
  const {data} = req.body
  console.log(data)
  try {
    const products = data.map((product) => {
      product.대여여부 == "O" ? product.대여여부 = 1 : product.대여여부 = 0
      product.반납여부 == "O" ? product.반납여부 = 1 : product.반납여부 = 0
      let newProduct = {
        mainCategory: product.대분류,
        subCategory: product.소분류,
        productName: product.품명,
        productCode: product.물품번호,
        rentalAvailability: product.대여여부,
        returnAvailability: product.반납여부,
        quantity: product.수량
      }
      return newProduct
    })
   
    const categoryList = async (list) => {
      for (const data of list) {
        let mainCategory = data.mainCategory
        let subCategory = data.subCategory
        await categoryRepository.crateSubCategory(mainCategory, subCategory)
      }
    }
    const registerList = async (list) => {
      for (const data of list) {
        await productRepository.createByExcel(data)
      }
    }
    registerList(products)
    categoryList(products)
    return res.status(200).json({ message: "성공적으로 등록 되었습니다" })
  } catch (error) {
    res.status(500).json({ message: "에러가 발생했습니다 잠시후 다시 시도 부탁드립니다" })
  }

})

// 물품 관리 페이지 렌더링
router.get('/manage', async (req, res) => {
  const user = req.user
  res.render('productManage', {user})
})

//물품 리스트 불러오는 api
router.get('/getAll', async (req, res) => {
  const products = await productRepository.getAll()
  if (!products) { return res.status(401).json({ message: '현제 등록된 물품이 없습니다' }) }
  return res.status(201).json(products)
})

// 물품 리스트 엑셀 내보내기
router.get('/export/excel', async (req, res) => {

  const products = await productRepository.getAll()

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('')
  const excelData = []
  for (let i = 0; i < products.length; i++) {
    let { category, productName, productCode, rentalQuantity, quantity, rentalAvailability, returnAvailability, registerDate } = products[i]

    rentalAvailability == 1 ? rentalAvailability = "O" : rentalAvailability = "X"
    returnAvailability == 1 ? returnAvailability = "O" : returnAvailability = "X"
    excelData.push([category.mainCategory, category.subCategory, productName, productCode, rentalQuantity, quantity, rentalAvailability, returnAvailability, registerDate]);

  }
  sheet.mergeCells('A1:I1');
  sheet.getCell('A1').value = '물품 리스트';
  sheet.getCell('A1').font = { size: 14, bold: true };
  sheet.getCell('A1').alignment = { horizontal: 'center' };
  sheet.getCell('A1').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFF00' },
    bgColor: { argb: 'FF0000FF' },
  };
  sheet.getRow(2).values = ['대분류', '소분류', '품명', '물품번호', '대여중', '잔여수', '대여여부', '반납여부', '등록일'];
  sheet.getRow(2).font = { size: 10, bold: true };
  sheet.getRow(2).alignment = { horizontal: 'center' };

  // 엑셀 리스트 삽입
  sheet.addRows(excelData);

  const _filename = `C:/Users/mn001/Downloads/product_list${new Date().getTime()}.xlsx`;
  try {
    await workbook.xlsx.writeFile(_filename);  // filename은 임시 파일이므로 어지간하면 겹치지않게 getTime

    res.setHeader("Content-disposition", "attachment; filename=ReviewComment.xlsx"); // 다운받아질 파일명 설정
    res.setHeader("Content-type", "application/vnd.ms-excel; charset=utf-8"); // 파일 형식 지정

    var filestream = fs.createReadStream(_filename); // readStream 생성
    filestream.pipe(res); // express 모듈의 response를 pipe에 넣으면 스트림을 통해 다운로드된다.

    //fs.unlinkSync(_filename); // 다운했으니 삭제
    return res.status(200).json({ message: '엑셀로 내보내 졌습니다' })
  } catch (error) {
    console.log(e);
    res.status(400).json({ message: '파일을 다운로드하는 중에 에러가 발생하였습니다.' });
    return;
  }
})

// 물품대여 폼
router.get('/rentalForm/:productCode', async (req, res) => {
  const productCode = req.params.productCode
  const product = await productRepository.findByProductCode(productCode)
  return res.render('rentalForm', { product })
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
  if (product.rentalAvailability == 0) { return res.status(409).json({ message: "대여가 불가능한 품목입니다" }) }
  const product_id = product._id.toHexString()
  if (product.returnAvailability == 1) {
    if (!duedate || !issuedate || new Date(issuedate) > new Date(duedate)) return res.status(409).json({ message: "대여시간 설정이 잘못되었습니다" })
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
    issuedate,
    reason
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
  product.rentalQuantity += 1
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
    for (let i = 0; i < product.lended.length; i++) {
      if (product.lended[i].username.includes(username) && !product.lended[i].returndate) return product
    }
  }).filter((product) => product)
  return res.status(200).json(searchProducts)
})

//물품별 대여자 목록
router.get('/usersInf/:productCode', async (req, res) => {
  const productCode = req.params.productCode
  const product = await productRepository.findByProductCode(productCode)
  const lendedUsers = product.lended.filter((user) => !user.returndate)
  if (!lendedUsers.length) return res.render('error/noContent')
  return res.render('product/productUser', { lendedUsers })
})

//물품별 대여이력 목록
router.get("/rentalRecord/:productCode", async (req, res) => {
  const productCode = req.params.productCode
  const product = await productRepository.findByProductCode(productCode)
  const lendedUsers = product.lended
  if (!lendedUsers.length) return res.render('error/noContent')
  return res.render('product/rentalRecord', { lendedUsers })
})
// 물품반납 API
router.post('/return', isAuth, async (req, res) => {
  const productCode = req.body.productCode
  const returndate = util.getDate()
  let user = req.user
  let product = await productRepository.findByProductCode(productCode)
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
  product.rentalQuantity -= 1
  product.lended = updateLended

  await productRepository.updateByProduct(product)
  await userRepository.updateUserbyUser(user)
  res.redirect('/users/status')
});

//물품 편집화면 출력
router.get('/edit/:productCode', async (req, res) => {
  const productCode = req.params.productCode
  const product = await productRepository.findByProductCode(productCode)
  res.render('product/productEdit', { product })
})
//물품 편집 api
router.post('/edit', async (req, res) => {
  const { oproductCode, mainCategory, subCategory, productName, returnAvailability, rentalAvailability, productCode, quantity } = req.body

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
  const updateProduct = { productName, returnAvailability, rentalAvailability, productCode, quantity, category, registerDate }
  await productRepository.updateProduct(findProduct._id, updateProduct)
  await userRepository.updateLendingByProduct_id(product_id, { mainCategory, subCategory, productCode, productName })
  res.status(201).json({ message: "물품수정 성공" });
});

//대여현황(대여중인 물품리스트)
router.get('/rentalList', async (req, res) => {
  const user = req.user
  const products = await productRepository.getAllBeingRented()
  const rentedProducts = products.map((product) => {
    product.lended = product.lended.filter((record) => !record.returndate)
    return product
  })

  res.render('product/rentalList', { rentedProducts, user })

})

//물품 삭제 api
router.post('/delete', async (req, res) => {
  const { productCode } = req.body
  await productRepository.deleteByProductCode(productCode)
  res.status(201).json({ message: '삭제되었습니다' });
});

export default router;
