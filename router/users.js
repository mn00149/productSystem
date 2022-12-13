import express from 'express';
import dotenv from 'dotenv'
dotenv.config()
import { body, param, validationResult } from 'express-validator';
import { isAuth } from '../middleware/auth.js';
import * as userController from '../controller/user.js'


const router = express.Router();

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
router.post('/signup', validateRegister, userController.signup)

//로그인 api
router.post('/signin', userController.signin)

//이용자 현황 페이지렌더링 
router.get('/status', isAuth, userController.renderUserStatus)

// 이용자 관리 페이지 렌더링(유저 정보까지 가져감)
router.get('/manage', userController.rederUserManage)

// password 리셋 api
router.post('/resetPassword', userController.resetPassword)

// 이용자 추방 api
router.post('/delete', userController.deleteUser)

//권한 수정 api
router.post('/edit/right', userController.editRight)

//사번으로 이용자조회 api
router.get('/info/:employeeNumber', userController.getInfoByEmployeeNumber)

export default router;
