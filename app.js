import express from 'express';
import cookieParser from 'cookie-parser'
import { body, param, validationResult } from 'express-validator';
import ExcelJS from 'exceljs';
import fs from 'fs';
import { connectDB } from './database/database.js';
import { isAuth } from './middleware/auth.js';
import productRouter from './router/products.js';
import userRouter from './router/users.js';
import categoryRouter from './router/category.js';
import * as right from './middleware/right.js'

const port = 8080
const app = express();
app.set('views', './views')
app.set('view engine', 'ejs')

app.use(cookieParser())
app.use(express.json()); // REST API -> Body
app.use(express.urlencoded({ extended: true })); // HTML Form -> Body
const options = {
  dotfiles: 'ignore',
  etag: false,
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now());
  },
};
app.use('/public', express.static(('public')));
app.use('/products', productRouter);
app.use('/users', userRouter);
app.use('/category', categoryRouter);
app.get('/', (req, res) => {

  res.redirect('/products/manage')
});
//회원가입 페이지
app.get('/signupForm', (req, res) => {
  const user = req.user
   res.render('signupForm', {user})
 });

 app.get('/signinForm', (req, res) => {
  const user = req.user
  res.render('signinForm', {user})
});

//isAut 미들웨어 테스트 및 권한 확인 미들웨어 테스트 api
app.get('/authTest', isAuth, right.edit , async (req, res) => {
  const user = req.user
  res.send(user)
});

app.post('/test', async(req, res) => {
  console.log(req.body)
})

app.get('/excelForm', async(req, res) => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('')
  const cellStyle = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFF00' },
    bgColor: { argb: 'FF0000FF' },
  };
  const cellList = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1' ]
  // sheet.mergeCells('A1:G1');
  // sheet.getCell('A1').value = '물품 등록 양식';
  //sheet.getCell('A1:G1').font = { size: 14, bold: true };
  
  sheet.getRow(1).values = ['대분류', '소분류', '품명', '물품번호', '대여여부', '반납여부', '수량'];
  sheet.getRow(1).font = { size: 11, bold: true };
  sheet.getRow(1).alignment = { horizontal: 'center' };
  cellList.forEach((cell) => {
    sheet.getCell(cell).fill = cellStyle
  })
  //sheet.getCell('A1:G1').fill = cellStyle

  // 엑셀 리스트 삽입

  const _filename = `C:/Users/mn001/Downloads/product_list${new Date().getTime()}.xlsx`;
  try {
    await workbook.xlsx.writeFile(_filename);  // filename은 임시 파일이므로 어지간하면 겹치지않게 getTime

  res.setHeader("Content-disposition", "attachment; filename=ReviewComment.xlsx"); // 다운받아질 파일명 설정
  res.setHeader("Content-type", "application/vnd.ms-excel; charset=utf-8"); // 파일 형식 지정

  var filestream = fs.createReadStream(_filename); // readStream 생성
  filestream.pipe(res); // express 모듈의 response를 pipe에 넣으면 스트림을 통해 다운로드된다.

  return res.status(200).json({message: '엑셀 양식이 다운로드 되었습니다' })
  } catch (error) {
    console.log(e);
    res.status(400).json({message:'파일을 다운로드하는 중에 에러가 발생하였습니다.'});
    return;
  }
})

//최종 에러처리 담당 api
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong' });
});

connectDB()
  .then(() => {
    app.listen(port);
    console.log("DB connected and server listen at port:" +port)
  })
  .catch(console.error);


