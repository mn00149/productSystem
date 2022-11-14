
export const edit = async (req, res, next) => {
    try {
        let user = req.user
        let right = user.right
        if(user.role == 'manager')return next()
        if (!isRight(right, "edit")) {
            return res.status(401).json({ message: '편집권한이 필요한 페이지 입니다' })
        }
        next()
    }
    catch (err) {
        console.log("edit 미들웨어에서 발생:" + err)
        return res.status(500).json(RIGHT_ERROR);
    }
}

export const opne = async (req, res, next) => {
    try {
        let user = req.user
        let right = user.right
        if (!isRight(right, "open")) {
            return res.status(401).json({ message: '열람권한이 필요한 페이지 입니다' })
        }
        next()
    }
    catch (err) {
        console.log("open 미들웨어에서 발생:" + err)
        return res.status(500).json(RIGHT_ERROR);
    }

}

export const register = async (req, res, next) => {
    try {
        let user = req.user
        let right = user.right
        if (!isRight(right,'register')) {
            return res.status(401).json({ message: '등록권한이 필요한 페이지 입니다' })
        }
        next()
    }
    catch (err) {
        console.log("register 미들웨어에서 발생:" + err)
        return res.status(500).json(RIGHT_ERROR);
    }

}

export const rent = async (req, res, next) => {
    try {
        let user = req.user
        let right = user.right
        if (!isRight(right, "rent")) {
            return res.status(401).json({ message: '대여권한이 필요한 페이지 입니다' })
        }
        next()
    }
    catch (err) {
        console.log("rent 미들웨어에서 발생:" + err)
        return res.status(500).json(RIGHT_ERROR);
    }

}

function isRight(userRight, right) {
    let result = false
    userRight.forEach(element => {
        element.trim() == right ? result = true : null
    });
    
    return result
}
