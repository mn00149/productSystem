import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from 'dotenv'
dotenv.config()
import * as userRepository from '../models/User.js';
import * as deletedUserRepository from '../models/DeletedUser.js'
import * as productRepository from '../models/Product.js'

//Make Secure
const jwtSecretKey = process.env.JWT_SECRET;
const jwtExpiresInDays = "2d";
const bcryptSaltRounds = 8;
// 회원 가입 처리 컨트롤러
export async function signup(req, res) {
    let { username, email, password, department, employeeNumber, role } = req.body;

    const findEmail = await userRepository.findByEmail(email)
    if (findEmail) {
        return res.status(409).json({ message: `${email} already exists` });
    }
    const isDeletedUser = await deletedUserRepository.findByEmployeeNumber(employeeNumber)
    if (isDeletedUser) return res.status(400).json({ message: "추방된 이력이 있습니다 관리자에게 문의 해주세요" })
    const findEmployeenumber = await userRepository.findByEmployeeNumber(employeeNumber)
    if (findEmployeenumber) {
        return res.status(409).json({ message: `${employeeNumber} already exists` });
    }
    try {
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
        return res.status(200).json({ message: "회원가입 성공" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "서버에 에러가 발생하였습니다. 잠시후 다시 시도해주시길 바랍니다" })
    }
}
//로그인 처리 컨트롤러
export async function signin(req, res) {
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
}

//jwt 토큰생성 함수
function createJwtToken(employeeNumber) {
    return jwt.sign({ employeeNumber }, jwtSecretKey, { expiresIn: jwtExpiresInDays });
}
// 이용자(나의) 현황 페이지 렌더링
export async function renderUserStatus(req, res) {
    const user = req.user
    res.render('user/userStatus', { user })
}
//전체 이용자 현황 관리 페이지 레더링 컨트롤러
export async function rederUserManage(req, res) {
    const user = req.user
    const users = await userRepository.getAll()
    res.render('user/userManage', {users, user})
  }
//password 초기화 처리 컨트롤러
export async function resetPassword(req, res) {
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
  }
//이용자 추방 컨트롤러
  export async function deleteUser(req, res) {
    const {employeeNumber} = req.body
    try {
      await productRepository.updateDeletedUser(employeeNumber)
      await userRepository.deleteByEmployeeNumber(employeeNumber)
      return res.status(200).json({message:"회원이 추방 되었습니다"})
    } catch (error) {
      console.log(error)
      return res.status(500).json({message:'서버에 에러가 생겼습니다 나중에 다시 시도 바랍니다'})
    }
  }
// 권한 수정 처리 컨트롤러
  export async function editRight(req, res) {
    const {employeeNumber, right} = req.body
    console.log(right)
    let user = await userRepository.findByEmployeeNumber(employeeNumber)
    user.right = right
    await userRepository.updateUserbyUser(user)
    res.status(200).json({message:"권한이 수정 되었습니다"})
  }
// 사번으로 이용자 정보 조회
  export async function getInfoByEmployeeNumber(req, res) {
    const employeeNumber = req.params.employeeNumber
    const user = await userRepository.findByEmployeeNumber(employeeNumber)
    res.status(200).json(user)
  }

