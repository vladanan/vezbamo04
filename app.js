const express = require('express');

const pitanjaRoutes = require('./routes/pitanjaRoutes');
const zadaciRoutes = require('./routes/zadaciRoutes');
const sajtRoutes = require('./routes/sajtRoutes');
const c_testRoutes = require('./routes/c_testRoutes');
const ajaxRoutes = require('./routes/ajaxRoutes');
const adminRoutes = require('./routes/adminRoutes');

const fileUpload = require('express-fileupload');
const path = require('path');

const Vue = require('vue')
const { BootstrapVue, IconsPlugin } = require('bootstrap-vue')

// Import Bootstrap and BootstrapVue CSS files (order is important)
//require ('bootstrap/dist/css/bootstrap.css')
//require ('bootstrap-vue/dist/bootstrap-vue.css')

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)


// https://shadowsmith.com/how-to-deploy-an-express-api-to-vercel
// https://github.com/ichtrojan/essential-kit/pull/11

// express app
const app = express();

//https://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
//app.listen(process.env.PORT || 3000, "0.0.0.0");

app.listen(3001, "0.0.0.0");

//sets the app engine so exp
app.engine("ejs", require("ejs").__express);

// register view engine
app.set('view engine', 'ejs');

//specifies the path to access the views
app.set("views", path.join(__dirname, "views"))

// Set public static path
//app.use(express.static(path.join(__dirname, './public')))
app.use(express.static(path.join(__dirname, 'public')))

// Postavlja pod imenom node_mod staticki path node_modules da bi se koristio
// u .ejs fajlovima jer ejs svaki path posmatra relativno u odnosu na njegov view folder koji
// je gore podešen tako da u .ejs fajlovima ne može da se pristupi ničemu ispot tog foldera
app.use("/styl", express.static(path.join(__dirname, "styles")));

// Set favicon
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// middleware & static files
//app.use(express.static('public'));
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

module.exports = app;