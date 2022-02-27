const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');

const app = express();

// Settings
app.set('port', 4000);
app.set('views', path.join(__dirname, 'views'));

app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');


// Routes
app.use(require('./routes/main.routes'));

// Public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../node_modules/socket.io/client-dist')));

//error response
/*
app.use(function(req, res, next) {
    res.status(404).render('404');
});
*/

// Starting
/*
app.listen(app.get('port'), () => {
    console.log('Server is on port', app.get('port'));
});*/

module.exports = app;