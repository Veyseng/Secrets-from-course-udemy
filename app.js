const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const logger = require('./middlewares/logger');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const app = express();

//Allow app to use public folder
app.use(express.static("public"));
//log request
app.use(morgan('tiny'));
// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

  // EJS
app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('views',path.resolve(__dirname,'views/'));

//Limite the file uploading 
app.use(fileUpload({
  limits: { fileSize: 20* 1024 * 1024}
}));

// Express body parser
app.use(express.urlencoded({ extended: true }));
app,use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Express session
app.use(
  session({
    cookie:{
      path:'/',
      httpOnly:true,
      sameSite:true,
      maxAge:2000*60*60,
      secure:false
    },
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/home', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
const products = require(`./routes/products`);

//Use logger
app.use(logger);

//mount routers
app.use('/api/v1/products',products);

const PORT = process.env.PORT || 4000;
app.listen(PORT, console.log(`Running on port ${PORT}`));
