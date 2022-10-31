import jwt, { decode } from 'jsonwebtoken'
import * as userRepository from '../models/User.js'
import dotenv from 'dotenv'
dotenv.config()

const AUTH_ERROR = { message: 'Authentication Error' }
const jwtSecretKey = process.env.JWT_SECRET; 

export const isAuth = async (req, res, next) => {
    try {
        let token = req.cookies.x_auth
        if (!token) {
            return res.status(401).json(AUTH_ERROR)
        }
        jwt.verify(token, jwtSecretKey, async (error, decoded) => {
            
            const user = await userRepository.findByEmployeeNumber(decoded.employeeNumber)
            if(!user){
                return res.status(401).json(AUTH_ERROR);
            }
            req.user = user
            console.log('auth미들웨어')
            next()
        })
    }
    catch (err) {
        console.log("auth 미들웨어에서 발생:" + err)
        return res.status(401).json(AUTH_ERROR);
    }
    
}