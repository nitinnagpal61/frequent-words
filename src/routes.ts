import express = require('express');
import { getWords } from './frequency-crawler';

const router = express.Router();
const testUrl = 'https://www.314e.com/';

router.get('/', (req, res) => {
  let words = [];
  words = getWords(testUrl, 4);
  res.render('index', { words: words});
});


module.exports = router;
