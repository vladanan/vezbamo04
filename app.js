const express = require('express');
const pitanjaRoutes = require('./routes/pitanjaRoutes');
const zadaciRoutes = require('./routes/zadaciRoutes');
const sajtRoutes = require('./routes/sajtRoutes');
const c_testRoutes = require('./routes/c_testRoutes');
const ajaxRoutes = require('./routes/ajaxRoutes');
const adminRoutes = require('./routes/adminRoutes');
const fileUpload = require('express-fileupload');


// Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process

// express app
const app = express();

//https://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
//app.listen(3000, "0.0.0.0");
app.listen(process.env.PORT || 3000, "0.0.0.0");

// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// default options
app.use(fileUpload());

// routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// pitanja routes
app.use('/pitanja', pitanjaRoutes);

// zadaci routes
app.use('/zadaci', zadaciRoutes);

// sajt routes
app.use('/sajt', sajtRoutes);

// korisnički test routes
app.use('/c_test', c_testRoutes);

// ajax routes
app.use('/ajax', ajaxRoutes);

// admin routes
app.use('/admin1', adminRoutes);

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});