"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const frequency_crawler_1 = require("./frequency-crawler");
const router = express.Router();
const testUrl = 'https://www.314e.com/';
router.get('/', (req, res) => {
    const words = frequency_crawler_1.getWords(testUrl, 4);
    for (let index = 0; index < words.length; index++) {
        res.send(`${words[index].word} => ${words[index].count}`);
    }
});
module.exports = router;
