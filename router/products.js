import express from 'express';
import { isAuth } from '../middleware/auth.js';
import * as productController from '../controller/product.js'

const router = express.Router();

router.get('/', async (req, res) => {
  res.status(201).send('GET: /products');
});

//물품등록 폼 화면 호출 api
router.get('/register', async (req, res) => {
  const user = req.user
  res.render('productRegister', { user })
})

//물품등록 popup 폼 화면 호출 api
router.get('/register/popup', async (req, res) => {
  const user = req.user
  res.render('productRegisterPop')
})

//물품등록 api
router.post('/register', productController.register);

//엑셀로 물품등록
router.post('/register/excel', productController.registerByExcel)

//물품 관리 페이지 렌더링
router.get('/manage', async (req, res) => {
  const user = req.user
  res.render('productManage', { user })
})

//물품 리스트 불러오는 api
router.get('/getAll', productController.getAll)

//물품 리스트 엑셀 내보내기
router.get('/export/excel', productController.ExportAllByExcel)

//물품대여 폼 렌더링
router.get('/rentalForm/:productCode', productController.rederRentalForm)

//물품 대여 api
router.post('/rent', isAuth, productController.rent)

//물품명으로 물품 검색
router.get('/search/productName/:productName', productController.searchByProductName)

//대여자로 물품검색
router.get('/search/username/:username', productController.searchByUsername)

//물품별 대여자 목록
router.get('/usersInf/:productCode', productController.getProductUserList)

//물품별 대여이력 목록
router.get("/rentalRecord/:productCode", productController.getRentalRecord)

//물품반납 API
router.post('/return', isAuth, productController.returnProduct);

//물품 편집화면 출력
router.get('/edit/:productCode', productController.renderEditForm)

//물품 편집 api
router.post('/edit', productController.edit);

//대여현황(대여중인 물품리스트)
router.get('/rentalList', productController.getRentalList)

//물품 삭제 api
router.post('/delete', productController.remove);

export default router;
