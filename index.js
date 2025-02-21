const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes')
const adminRoutes = require('./routes/adminRoutes')
const connectDB = require('./config/connectDB')
const session = require('express-session')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const path = require('path')

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

const corsOptions = {
    origin: ["allwingeorge.shop","www.allwingeorge.shop"], // Your frontend URL
    credentials: true, // Allow credentials (cookies, headers, etc.)
};
  
  app.use(cors(corsOptions));

app.use(session({
    secret:"entammo",
    resave:false,
    saveUninitialized:true,
}))

app.use('/uploads', express.static(path.join(__dirname, 'multer', 'uploads')));
app.use('/uploads', express.static('uploads'));


app.use('/',userRoutes)
app.use('/admin',adminRoutes)
connectDB();
app.listen(3000,()=>console.log("backend running at port 3000"))