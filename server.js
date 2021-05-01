require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path')
const ejs = require('ejs')
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const PORT = process.env.PORT || 3000;
const flash = require('express-flash');
const MongodbStore = require('connect-mongo')(session);
const passport = require('passport');
const Emitter = require('events')

// database connection
// const DATABASE_URL = "mongodb+srv://PizzaUser:12345@cluster0.rnxiv.mongodb.net/pizza";
mongoose.connect(process.env.Mongo_Connection_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true });
const db = mongoose.connection
db.on('error', (err) => console.log(err))
db.once('open', () => console.log('Database created...'))


// session store
let mongoStore = new MongodbStore({
    mongooseConnection: db,
    collection: 'sessions',

})
// Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)
// session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    // cookie: {maxAge: 1000*15} //15sec
    cookie: {maxAge: 1000*60*60*24} //24hour
}))

// passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

// as a middleware use
app.use(flash());
// assets
app.use(express.static('public'))

// set templet engine
app.use(expressLayout);
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended: false }))
app.use(express.json());
// global middleware
app.use((req,res,next) => {
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
})
// import
require('./routes/web')(app)
app.use((req,res) => {
    res.status(404).send('<h1>404, Page not found</h1>')
})

const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT} `)
})

// socket 
const io = require('socket.io')(server)
io.on('connection',(socket) => {
    // Join (connect client)
    console.log(socket.id)
    socket.on('join', (orderId) => {
        console.log(orderId)
        socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated',data)
})