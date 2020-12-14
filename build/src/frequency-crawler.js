"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWords = void 0;
const cheerio = __importStar(require("cheerio")); // to parse html elements on the page.
const url_parse_1 = __importDefault(require("url-parse")); // to parse urls on the page.
const lodash_1 = __importDefault(require("lodash"));
const source_1 = __importDefault(require("got/dist/source"));
const Freq = require('wordfrequenter');
let maxNoOfPages = 0;
let baseUrl = '';
const pagesVisited = Object.assign({});
let numPagesVisited = 0;
const pagesToNavigate = [];
const words = [];
function getWords(testUrl, nofPages) {
    maxNoOfPages = nofPages;
    const url = new url_parse_1.default(testUrl);
    baseUrl = `${url.protocol}'//'${url.hostname}`;
    pagesToNavigate.push(url);
    runCrawl();
    return words;
}
exports.getWords = getWords;
;
function runCrawl() {
    if (numPagesVisited >= maxNoOfPages) {
        console.log('Reached max limit of number of pages to visit.');
        return;
    }
    const nextPage = pagesToNavigate.pop();
    if (nextPage in pagesToNavigate)
        runCrawl(); // We've already visited this page, so repeat the crawl
    else
        navigateToNext(nextPage, runCrawl); // New page we haven't visited
}
function navigateToNext(url, callback) {
    pagesVisited[url] = true;
    numPagesVisited++;
    console.log(`Starting with page ${url}`);
    source_1.default(url).then(response => {
        if (response.statusCode !== 200) {
            callback();
            return;
        }
        // Parse the document body
        console.log(response.body);
        const cheerioCrawler = cheerio.load(response.body);
        const frequentWords = getFrequentWords(cheerioCrawler);
        if (frequentWords) {
            const wordsArr = lodash_1.default.orderBy(frequentWords, 'count', 'desc');
            for (let index = 0; index < wordsArr.length; index++) {
                if (index === 10)
                    break;
                const element = wordsArr[index];
                words.push(element);
            }
        }
        else {
            getUrls(cheerioCrawler);
            callback();
        }
    }).catch(err => {
        console.log(err);
    });
}
// finds the most frequent words ignoring the special characters and empty string.
function getFrequentWords(cheerioCrawler) {
    const arr = [];
    const bodyText = cheerioCrawler('html > body').text().toLowerCase().split(' ');
    for (let index = 0; index < bodyText.length; index++) {
        const ele = bodyText[index].trim().replace(/[^A-Z0-9]/ig, ''); // replace if any special characters.
        if (ele !== '')
            arr.push(ele);
    }
    const wf = new Freq(arr);
    wf.set('string');
    return wf.list();
}
const getUrls = (cheerioCrawler) => {
    const urls = cheerioCrawler(`a[href^=' / ']`);
    console.log(`Found ${urls.length} found urls on page`);
    urls.each(() => { pagesToNavigate.push(baseUrl + cheerioCrawler(this).attr('href')); });
};
