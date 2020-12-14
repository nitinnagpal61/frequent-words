
import request = require('request'); // to make http requests.
import * as cheerio from 'cheerio'; // to parse html elements on the page.
import URL from 'url-parse'; // to parse urls on the page.
import _ from 'lodash';
import { Word } from '../models/word';
import got from 'got';

const Freq = require('wordfrequenter');

let maxNoOfPages = 0;
let baseUrl: string = '';
const pagesVisited = Object.assign({});
let numPagesVisited = 0;
const pagesToNavigate: any[] = [];
let words: Word[] = [];

export function getWords(testUrl: string, nofPages: number) {
  maxNoOfPages = nofPages;
  const url = new URL(testUrl);
  baseUrl = `${url.protocol}//${url.hostname}`;
  pagesToNavigate.push(baseUrl);
  runCrawl();
  return words;
};

 function runCrawl() {
  if (numPagesVisited >= maxNoOfPages) {
    console.log('Reached max limit of number of pages to visit.');
    return;
  }
  const nextPage = pagesToNavigate.pop();
  if (nextPage in pagesToNavigate) runCrawl();  // We've already visited this page, so repeat the crawl
  else navigateToNext(nextPage, runCrawl); // New page we haven't visited
}

async function navigateToNext(url: string, callback: any) {
  pagesVisited[url] = true;
  numPagesVisited++;
  console.log(`Starting with page ${url}`);

  const response = await got(url);
    if (response.statusCode !== 200) {
      callback();
      return;
    }
    const cheerioCrawler = cheerio.load(response.body); // parse the html in the page.
    const frequentWords = getWordsDictionary(cheerioCrawler); // get the text inside the body of the html & find
    if (frequentWords) {
      const wordsArr = _.orderBy(frequentWords,'count', 'desc');
      for (let index = 0; index < wordsArr.length; index++) {
        if(index === 10) break;
        const element = wordsArr[index];
        words.push(element);
      }
    } 
    else {
      getUrls(cheerioCrawler);
      callback();
    } 
}

// gets the dictionary of words which are more frequently usedignoring the special characters and empty string.
function getWordsDictionary(cheerioCrawler: cheerio.Root) {
  const arr = [];
  const bodyText = cheerioCrawler('html > body').text().toLowerCase().split(' ');
  for (let index = 0; index < bodyText.length; index++) {
    const ele = bodyText[index].trim().replace(/[^A-Z0-9]/ig, ''); // replace if any special characters.
    if (ele !== '') arr.push(ele);
  }

  const wf = new Freq(arr); // evaluates here more frequent words.
  wf.set('string');
  return wf.list();
}

const getUrls = (cheerioCrawler: cheerio.Root) => {
  const urls = cheerioCrawler(`a[href^=' / ']`);
  console.log(`Found ${urls.length} found urls on page`);
  urls.each(() => { pagesToNavigate.push(baseUrl + cheerioCrawler(this).attr('href'));});
}
