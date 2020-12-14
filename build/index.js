"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const routes = require('./src/routes');
const app = express();
const port = 3000;
app.use('/findWords', routes);
app.listen(port, () => { console.log(`Word Frequency App listening at http://localhost:${port}`); });
