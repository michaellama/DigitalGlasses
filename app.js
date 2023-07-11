require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Require Passport and the Passport configuration
const passport = require('passport');
require('./passport-config')(passport);
const flash = require('connect-flash');

const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');

const app = express();
const PORT = 3000 || process.env.PORT;

//Connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI_SESSIONS
    }),
}))

// Use the Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.static('public'));

//Templating Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/login'));

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});