require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Room = require('./models/rooms');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const booking = require('./models/booking');
const Booking = require('./models/booking');
const bookingValidationSchema = require('./joivalid');
const methodOverride = require('method-override');
const catchAsync = require('./catchAsync');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/stayw';
const MongoStore = require('connect-mongo');
app.use(expressLayouts);
app.set('layout', 'layout');


const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret: 'mayankgautamsoftdev',
  touchAfter: 24 * 60 * 60
});
store.on('error', function(e) {
  console.log("SESSION STORE ERROR",e)
})

// mongoose.connect('mongodb://127.0.0.1:27017/stayw', {
// })
// .then(() => {
//     console.log("Database connected");
// })
// .catch((err) => {
//     console.log("Unable to connect to database");
// })

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store,
  name: 'session',
  secret: 'thisisasecrect',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Database connected");
});

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  req.flash('error', 'Admin access only');
  res.redirect('/');
}

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.isLoggedIn = req.isAuthenticated();
  next();
});

app.get('/admin/booking',isAdmin,catchAsync(async(req,res) => {
  const bookings = await Booking.find({}).populate('user').populate('room');
  res.render('admin',{bookings});
}))

app.patch('/admin/bookings/:id/accept', isAdmin, catchAsync(async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, { status: 'accepted' });
  req.flash('success', 'Booking accepted.');
  res.redirect('/admin/booking');
}));

app.patch('/admin/bookings/:id/reject', isAdmin, catchAsync(async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, { status: 'rejected' });
  req.flash('success', 'Booking rejected.');
  res.redirect('/admin/booking');
}));

app.post('/register', (req, res, next) => {
  const { username,email, password } = req.body;
  User.register(new User({ username,email }), password, (err, user) => {
    if (err) {
        req.flash('error',err.message)
        return res.redirect('/register');
    }
    passport.authenticate('local')(req, res, () => {
        req.flash('success', 'Welcome, ' + user.username + '!');
        res.redirect('/');
    });
  });
});

app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get('/register',(req,res) => {
    res.render('register');
})

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), (req,res) => {
    req.flash('success','Welcome');
    res.redirect('/rooms');
});

app.get('/login',(req,res) => {
    res.render('login');
})

app.get('/aboutus',isLoggedIn,(req,res) => {
    res.render('aboutus');
})

app.get('/rooms',catchAsync(async(req,res) => {
    const rooms = await Room.find({});
    res.render('rooms',{rooms});
}))

app.get('/user/:id',(req,res) => {
    res.render('userinfo');
})

app.get('/rooms/:id',catchAsync(async(req,res) => {
    const {id} = req.params;
    const rooms = await Room.findById(id);
    res.render('show',{rooms});
}))

app.post('/booking',isLoggedIn,catchAsync(async(req,res) => {
  const {error} = bookingValidationSchema.validate(req.body);
  if(error){
    req.flash('error',error.details[0].message);
    return res.redirect('/rooms');
  }
  const {room,checkIn,checkOut,usernm} = req.body;
  const user = req.user._id;
  const newBooking = new Booking({
    usernm,
    room,
    user,
    checkIn,
    checkOut
  })
  await newBooking.save();
  req.flash('success','Booking successfull!');
  res.redirect('/rooms');
}))

app.get('/userinfo',isLoggedIn,catchAsync(async(req,res) => {
  const user = await User.findById(req.user._id);
  const bookings = await Booking.find({user: req.user._id}).populate('room');
  res.render('userinfo',{user,bookings});
}))

app.get('/rooms/:id/booking',isLoggedIn,catchAsync(async(req,res) => {
  const {id} = req.params;
  const room = await Room.findById(id);
  if(!room){
    req.flash('error','Room not found!');
    return res.redirect('/rooms');
  }
  res.render('booking', { room });
}))

app.delete('/booking/:id',isLoggedIn,catchAsync(async(req,res) => {
  const {id} = req.params;
  await Booking.findByIdAndDelete(id);
  res.redirect('/userinfo');
}))

app.get('/',(req,res) => {
    res.render('home');
})

app.use((req,res,next) => {
    res.status(404).render('errortemp',{error: {
        message: 'Page not found',
        stack: ''
    }})
})

app.use((err,req,res,next) => {
    console.log(err.stack);
    res.status(500).render('errortemp',{error: err});
})

app.listen(3000,() => {
    console.log("Listening");
})