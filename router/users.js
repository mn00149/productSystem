import express from 'express';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from 'dotenv'
dotenv.config()
import { body, param, validationResult } from 'express-validator';
import * as userRepository from '../models/User.js';
import * as deletedUserRepository from '../models/DeletedUser.js'
import { isAuth } from '../middleware/auth.js';


const router = express.Router();
//Make Secure
const jwtSecretKey = process.env.JWT_SECRET;
const jwtExpiresInDays = "2d";
const bcryptSaltRounds = 8;

//로그아웃 api
router.get('/logout', async (req, res) => {
 res.clearCookie('x_auth')
 res.redirect('/signinForm')
});
//validate 함수
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ message: errors.array()[0].msg });
};

const validateRegister = [
  body("email").isEmail().normalizeEmail().withMessage("invalid email"),
  body("employeeNumber").isInt().withMessage("사번은 숫자 입니다"),
  body("password")
    .trim()
    .isLength({ min: 4 })
    .withMessage("password should be at least 4 characters"),
  body("username").notEmpty().withMessage("username is missing"),
  validate,
];

// 회원가입 api
router.post('/signup',validateRegister, async (req, res) => {
  let { username, email, password, department, employeeNumber, role } = req.body;

  const findEmail = await userRepository.findByEmail(email)
  if (findEmail) {
    return res.status(409).json({ message: `${email} already exists` });
  }
  const isDeletedUser = await deletedUserRepository.findByEmployeeNumber(employeeNumber)
  if(isDeletedUser)return res.status(400).json({message:"추방된 이력이 있습니다 관리자에게 문의 해주세요"})
  const findEmployeenumber = await userRepository.findByEmployeeNumber(employeeNumber)
  if (findEmployeenumber) {
    return res.status(409).json({ message: `${employeeNumber} already exists` });
  }
try{
  const encPassword = await bcrypt.hash(password, bcryptSaltRounds)
  const newUser = {
    username,
    email,
    password: encPassword,
    department,
    employeeNumber,
    role
  }

  await userRepository.createUser(newUser)
  return res.status(200).json({
    message: "회원가입 성공"
  })
}catch{
  return res.status(500).json({message: "서버에 에러가 발생하였습니다. 잠시후 다시 시도해주시길 바랍니다"})
}
})

//로그인 api
router.post('/signin',async (req, res) => {
  const { employeeNumber, password } = req.body;
  const user = await userRepository.findByEmployeeNumber(employeeNumber);
  if (!user) {
    return res.status(401).json({ message: "Invalid employee number or password" });
  }
   const isValidPassword = await bcrypt.compare(password, user.password)
   if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid emailemployee number or password" });
  }

  const token = createJwtToken(employeeNumber)

  res.cookie('x_auth', token)
  .status(200)
  .json({
    loginSuccess: true,
    userId: user._id
  })

})

//토큰생성 함수
function createJwtToken(employeeNumber) {
  return jwt.sign({ employeeNumber }, jwtSecretKey, { expiresIn: jwtExpiresInDays });
}
//나의 현황 페이지렌더링
router.get('/status', isAuth, (req, res) => {
  const user = req.user
  res.render('user/userStatus', {user})
})

// 이용자 관리 페이지 렌더링(유저 정보까지 가져감)
router.get('/manage', async (req, res) => {
  const users = await userRepository.getAll()
  res.render('user/userManage', {users})
})

// password 리셋
router.post('/resetPassword', async (req, res) => {
  const {employeeNumber} = req.body;
  const user = await userRepository.findByEmployeeNumber(employeeNumber)
  if(!user){return res.status(400).json({message: '해당 사용자를 찾을 수 없습니다'})}
  try {
    const resetPassword = process.env.RESET_PASSWORD
    const resetEncPassword = await bcrypt.hash(resetPassword, bcryptSaltRounds)
    let newUser = user
    newUser.password = resetEncPassword
    await userRepository.updateUserbyUser(newUser)
    return res.status(200).json({message:"해당 유저의 패스워드가 초기화 되었습니다"})
  } catch (error) {
    console.log(error)
    return res.status(500).json({message:"서버에러 입니다"})
  }
})

// 이용자 추방 api
router.post('/delete', async (req, res) => {
  const {employeeNumber} = req.body
  try {
    await userRepository.deleteByEmployeeNumber(employeeNumber)
    return res.status(200).json({message:"회원이 추방 되었습니다"})
  } catch (error) {
    console.log(error)
    return res.status(500).json({message:'서버에 에러가 생겼습니다 나중에 다시 시도 바랍니다'})
  }
})

//권한 수정 api
router.post('/edit/rigth', async (req, res) => {
  const {employeeNumber, rigth} = req.body
  let user = await userRepository.findByEmployeeNumber(employeeNumber)
  user.right = rigth
  await userRepository.updateUserbyUser(user)
  
})


export default router;
