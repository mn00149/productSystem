import express from 'express';
import productRouter from './router/products.js';
import userRouter from './router/users.js';
import categoryRouter from './router/category.js';
import cookieParser from 'cookie-parser'
import { body, param, validationResult } from 'express-validator';
import { connectDB } from './database/database.js';
import { isAuth } from './middleware/auth.js';

const port = 8080
const app = express();
app.set('views', './views')
app.set('view engine', 'ejs')

app.use(cookieParser())
app.use(express.json()); // REST API -> Body
app.use(express.urlencoded({ extended: false })); // HTML Form -> Body
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
   res.render('signupForm')
 });

 app.get('/signinForm', (req, res) => {
  res.render('signinForm')
});

//isAut 미들웨어 테스트 api
app.get('/authTest', isAuth, async (req, res) => {
  const user = req.user
  res.send(user)
});

app.post('/test', async(req, res) => {
  console.log(req.body)
})

connectDB()
  .then(() => {
    app.listen(port);
    console.log("DB connected and server listen at port:" +port)
  })
  .catch(console.error);


