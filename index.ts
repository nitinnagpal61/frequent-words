const express = require('express');
const path = require('path');
const routes = require('./src/routes');

const app = express();
const port = 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/findWords', routes);
app.listen(port, () => { console.log(`Word Frequency App listening at http://localhost:${port}`)});