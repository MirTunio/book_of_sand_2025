/* jshint esversion: 8 */
/*
TUNIO 2025
Book of Sand

Inspired by 'The Book of Sand' by Jorge Luis Borges
https://archives.evergreen.edu/webpages/curricular/2010-2011/natural-order/Readings/Week_09/The_Book_of_Sands.pdf

All text content is from the Project Gutenberg archives
You can contribute to project Gutenberg with donations, or
with by proofreading a single page at https://www.pgdp.net/c/
PS: I did not take their permission (although I don't think
I have to), nor am I affiliated with the Project.

This work was created by Murtaza Tunio
Released under the Unlicense – public domain. https://unlicense.org
*/


// To Do: (Dont forget to set debug flag on proxy)
// Generative artwork on startup
// Make the page look better: Closer to the story description
// Add a stack of pages so it looks like a book
// Chinese text rendering test again ~ see cases
// Fix line breaks for cases like: 18375, 63266
// Add more mirrors and randomly switch between them (need to add rules in proxy too)
// Find a way to add illustrations or images? fetch html?
// Page flip animation - with rest of book background
// The buffer just seems wrong - but is it expensive?
// Enable cache in the proxy - need to before live - will save gutenberg and mirrors some trouble too
// Create own mirror?
//
// Wibes:
// Code needs to be presentable, short, commented, and slick
// Needs to be so fucking performant - trim all the fat - click clack

/*
It was a clothbound octavo volume which had undoubtedly passed through many hands.
I examined the book; its unexpected heft surprised me.
On the spine was printed Holy Writ and below that Bombay.
The characters were unfamiliar.
The pages, which appeared to me worn and of poor typographic quality, were printed in two columns like a Bible.
The text was cramped and arranged in versicles.
In the upper corner of each page were Arabic numerals.
It caught my attention that the even-numbered page bore, let’s say, the number 40,514 and the odd-numbered page that followed 999.
I turned the page; the overleaf bore an eight-digit number.
Also printed was a small illustration, like those in dictionaries: an anchor drawn in pen and ink, as though by a child’s unskilled hand.
I don’t know why they’re numbered in this arbitrary way. Perhaps it’s to demonstrate that an infinite series includes any number
*/



let font;
let chosen_font = "";
let buffer = []; // holds preloaded pages
let bufsize = 50;
let start_calls = 0;
let first_two_loaded = false;
let dex = 0; // pointer to read
let state = 0;
let maxQuery = 75355; // update manually from time to time
let startup_wait_ms = 10000; //15000;
let proxy = "https://winter-meadow-d6c5.tuniomurtaza.workers.dev/?url=";
let dots = "";
let dotCount = 0;
let isNotEmpty = item => !(Array.isArray(item) && item.length === 2 && item[0] === "" && item[1] === "");

const fonts = [
  "sans-serif", "serif", "monospace", "fantasy", "system-ui",
  "Arial", "Verdana", "Helvetica", "Tahoma", "Trebuchet MS", "Geneva",
  "Times New Roman", "Georgia", "Garamond", "Palatino Linotype", "Book Antiqua",
  "Courier New", "Lucida Console", "Monaco", "Consolas", "Courier", "Luminari", "Copperplate",
  "Segoe UI", "Calibri", "Cambria", "Candara", "Constantia", "Corbel",
  "Franklin Gothic Medium", "Microsoft Sans Serif",
  "San Francisco", "Gill Sans", "Optima", "American Typewriter",
  "Chalkboard", "Menlo", "Noteworthy", "Hoefler Text",
  "Ubuntu", "DejaVu Sans", "Liberation Sans", "Droid Sans", "FreeSans"
];


function setup() {
  let hh =  floor(windowHeight*0.9);
  let ww = min(windowWidth*0.95, floor(hh * (2.2 / 3)));
  let cnv = createCanvas(ww, hh);
  cnv.class('shadowedCanvas'); 
  frameRate(25);
  background(242, 222, 189);
  fill(0);
  textSize(12);
  chosen_font = random(fonts);
  textFont(chosen_font);
}

function draw() {  
  switch (state) {
  case 0:
    background(242, 222, 189);
    fill(0);
    textSize(12);
    if (frameCount % 30 === 0) {
      dotCount = (dotCount + 1) % 6;
      dots = ".".repeat(dotCount > 3 ? 6 - dotCount : dotCount);
    }
    textSize(32);
    textAlign(CENTER, CENTER);
    text("THE BOOK OF SAND", width/2 - width/4, height/2 - height/4, width/2);
    textSize(16);
    textAlign(LEFT, BOTTOM);
    if (millis()+100 < startup_wait_ms && first_two_loaded) {
      text("Loading" + dots, width - 90, height - 20);
    }
    
    textAlign(RIGHT, TOP);
    if (frameCount % 10 === 0 && start_calls < bufsize/2) {
      addToBuffer();
      start_calls++;
    }
    first_two_loaded = buffer.length >= 2 && isNotEmpty(buffer[0]) && isNotEmpty(buffer[1]);

    start_graphic();
    
    if (millis() > startup_wait_ms && first_two_loaded) {
      state++;
    }
    break;

  case 1:
    //background(242, 222, 189);
    textSize(16);
    textAlign(LEFT, TOP);
    let start_text = "Click to change the page. Study the page well. You will never see it again...";
    //text(start_text, 18, 20, width - 40, height - 100);
    text(start_text, 18, height - 50, width - 40, height - 100);
    state++;
    break;

  case 2:
    if (frameCount % 10 === 0 && buffer.length - dex < bufsize) {
      addToBuffer();
    }
    if (frameCount % 250 === 0) {
      console.log("garbage_collection...");
      for (let i = 0; i + 1 < dex; i++) {
        delete buffer[i];
      }
    }
    break;
  }
}

function start_graphic(){
  let t = frameCount;
  noStroke();
  fill(0, 60);
  
  let x = width/2;
  let y = height/2 + (height/4) * noise(t/800);
  size = 100;
  beginShape();
  vertex(x, y - size / 2); // Top
  vertex(x + size / 2.5, y); // Right
  vertex(x, y + size / 2); // Bottom
  vertex(x - size / 2.5, y); // Left
  endShape(CLOSE);
  
  x = width/2;
  y = y + (size/2) * noise(t/800 + 1000);
  beginShape();
  vertex(x, y - size / 2); // Top
  vertex(x + size / 2.5, y); // Right
  vertex(x, y + size / 2); // Bottom
  vertex(x - size / 2.5, y); // Left
  endShape(CLOSE);
  
  fill(0);
}

function gutenbergPath(ebookNumber) {
    let digits = ebookNumber.toString().split('');
    let basePath = '/' + digits.slice(0, -1).join('/') + '/'; // All but the last digit as directories
    let folder = ebookNumber + '/'; // Folder with full ebook number
    let filename = ebookNumber; // Standard filename format
    return basePath + folder + filename;
}


async function getBook(triedA = false, X = 0) {
  console.log("Getting book...");

  if (!triedA) {
    X = Math.floor(Math.random() * maxQuery) + 1;  // Fix random int generation
    // 11 is Alice in wonderland no meta
    // 46740 is in Farsi
    // 25298 is in Chinese and overflows
    // 7367 is in Chinese and line breaks weirdly 
    // 18375 English line breaks weirdly
    // 63266 English line breaks weirdly 
  }

  // Gutenberg direct - Project Gutenberg (dont use)
  //let baseA = proxy + `https://www.gutenberg.org/files/${X}/${X}-0.txt`;
  //let baseB = proxy + `https://www.gutenberg.org/cache/epub/${X}/pg${X}.txt`;
  
  // Aleph mirror - Project Gutenberg 
  //let baseA = proxy + "http://aleph.gutenberg.org" + gutenbergPath(X) + "-0.txt";
  //let baseB = proxy + "http://aleph.gutenberg.org" + gutenbergPath(X) + ".txt";
  
  // U of Kent mirror - works for now Feb 2025
  let baseA = proxy + "http://www.mirrorservice.org/sites/ftp.ibiblio.org/pub/docs/books/gutenberg/" + gutenbergPath(X) + "-0.txt";
  let baseB = proxy + "http://www.mirrorservice.org/sites/ftp.ibiblio.org/pub/docs/books/gutenberg/" + gutenbergPath(X) + ".txt";
  
  
  
  let url = triedA ? baseB : baseA;
  console.log(url);

  try {
    let response = await fetch(url);
    let text = await response.text();

    if (text.includes("404 Not Found") || text.includes("Error 404")) {
      if (!triedA) {
        return getBook(true, X); // Try base B if base A fails
      } else {
        console.log(`Error: Book not found. {X}`);
        return { text: "Error: Book not found.", X }; // Fail if both fail
      }
    }

    text = text.replace(/(?:\s*\n\s*){3,}/g, '\n\n');
    return { text, X };  // Return book text and its ID

  } catch (error) {
    console.error("Failed to fetch book", error);
    return { text: "Error retrieving book.", X };
  }
}


function getMeta(full) {
  console.log("getting metadata...");
  let lines = full.split("\n");
  let meta = "";
  let foundTitle = false;
  let foundAuthor = false;
  let foundDate = false;
  let foundLanguage = false;

  for (let i = 0; i < lines.length / 5; i++) {
    let line = lines[i].trim();

    if (line.startsWith("Title:") && !foundTitle) {
      meta += (line.replace(/^Title:\s*/i, "") + (lines[i + 1] ? " " + lines[i + 1].trim() : "")).trim() + "\n";
      foundTitle = true;
    }
    if (line.startsWith("Author:") && !foundAuthor) {
      meta += line.replace(/^Author:\s*/i, "") + "\n";
      foundAuthor = true;
    }
    if (line.startsWith("Release Date:") && !foundDate) {
      let date = line.replace(/^Release Date:\s*/i, "").replace(/\s*\[.*?\]\s*$/, "");
      meta += date + "\n";
      foundDate = true;
    }
    if (line.startsWith("Language:") && !foundLanguage) {
      meta += line.replace(/^Language:\s*/i, "") + "\n";
      foundLanguage = true;
    }

    // Stop once all four are found
    if (foundTitle && foundAuthor && foundDate && foundLanguage) {
      break;
    }
  }

  return meta.trim() ? meta : " \n \n";//"NO META DATA";
}


function choosePart(full) {
  console.log("choosing page...");
  let showLines = 45;
  full = full.replace(/\n+/g, "\n");
  let lines = full.split("\n");
  let numLines = lines.length;
  if (numLines === 1){
    return "NO MTPAGEDATA!";
  }
  let mark0 = int(random(30, numLines - 30));
  while (lines[mark0].trim() === "") mark0++;
  if (showLines + mark0 > numLines) showLines = numLines - mark0;
  return lines.slice(mark0, mark0 + showLines).join("\n");
}



async function getPage(retries = 10) {
  if (retries <= 0) {
    console.error("Max retries reached. Unable to fetch book.");
    return ["", ""];
  }

  console.log("Getting page... (Retries left: " + retries + ")");
  let bookData = await getBook(false, 0);

  if (!bookData || typeof bookData.text !== "string") {
    console.error("Error: Book text is invalid.", bookData);
    return ["Error retrieving book metadata.\n\n", "Error retrieving book content."];
  }

  let { text, X } = bookData;
  let meta = getMeta(text);

  let parts = text.split("PROJECT GUTENBERG");
  let part = choosePart(parts[1] || "").replace(/_/g, "");
  
  if (part.includes("NO MTPAGEDATA!")) {
    console.warn("No text data found. Retrying...");
    return await getPage(retries - 1);
  }

  return [meta, part];
}

function wrapChineseText(str, maxWidth) {
  str = str.replace(/[\r\n]+/g, ' ').trim();
  let lines = [];
  let line = "";
  for (let i = 0; i < str.length; i++) {
    let testLine = line + str[i];
    if (textWidth(testLine) > maxWidth) {
      lines.push(line);
      line = str[i];
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  return lines.join("\n");
}

function adjustFontSize(textContent, maxWidth, maxFontSize, minFontSize) {
  let lines = textContent.includes("\n") ? textContent.split("\n") : [textContent]; 
  let testSize = maxFontSize;
  textSize(testSize);
  
  let longestLine = lines.reduce((longest, line) => 
    textWidth(line) > textWidth(longest) ? line : longest, ""); // Find the longest segment

  while (textWidth(longestLine) > maxWidth && testSize > minFontSize) {
    testSize-=0.3; // Reduce font size until it fits
    textSize(testSize);
  }

  return testSize;
}

function applyWeatheredEffect() {
  noFill();    
  blendMode(SOFT_LIGHT);
  stroke(0, 50); // Light black for subtle wear marks

  // Add noise-based texture
  for (let i = 0; i < 5 + random(40); i++) {
    let x = random(width);
    let y = random(height);
    let alpha = random(10, 40); // tweak
    fill(139, 69, 19, alpha); // Brownish smudges
    noStroke();
    ellipse(x,y,random(width*1), random(height*1));
  }

  // Slight fading on edges
  fade_end = width/8;
  for (let i = 0; i < fade_end; i+=1) {
    let fade = map(i, 0, fade_end, 200, 0); // tweak
    stroke(0, fade);
    line(i, 0, i, height);
    line(width - i, 0, width - i, height);
    line(0, i, width, i);
    line(0, height - i, width, height - i);
  }
  
  // Page bend shadow
  bend_end = width/5;
  for (let i = 0; i < bend_end; i+=0.5) {
    let x = i;
    let alpha = map(i, 0, bend_end, 120, 0);
    stroke(0, alpha);
    line(x, 0, x, height);
  }
  
  let numFibers = 4000;
  for (let i=0; i<numFibers; i++){
    let x1 = random() * width;
    let y1 = random() * height;
    let theta = random() * 2 * Math.PI;
    let segmentLength = random() * 4;
    let x2 = cos(theta) * segmentLength + x1;
    let y2 = sin(theta) * segmentLength + y1;
    stroke(
      15,
      10-random() * 5,
      100-random() * 8,
      random() * 10 + 75
    );
    line(x1, y1, x2, y2);
  
}

  blendMode(BLEND);
  //filter(BLUR, 15); // OOF
}

function hasEnoughLexicographicCharacters(page_content) {
  const lexicographicCharRegex = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Devanagari}]/gu;
  const matches = page_content.match(lexicographicCharRegex);
  return matches && matches.length >= 30;
}

function isMostlyRTL(text, threshold = 30) {
    // Unicode ranges for RTL scripts
    const rtlRanges = [
        /[\u0590-\u05FF]/, // Hebrew
        /[\u0600-\u06FF]/, // Arabic, Persian, Urdu
        /[\u0700-\u074F]/, // Syriac
        /[\u0750-\u077F]/, // Arabic Supplement
        /[\u08A0-\u08FF]/, // Arabic Extended-A
        /[\uFB50-\uFDFF]/, // Arabic Presentation Forms-A
        /[\uFE70-\uFEFF]/  // Arabic Presentation Forms-B
    ];

    let rtlCount = 0, totalCount = 0;

    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (!char.trim()) continue; // Ignore spaces & punctuation

        totalCount++;
        if (rtlRanges.some(range => range.test(char))) {
            rtlCount++;
            if (rtlCount > threshold) return true; // Stop early if threshold exceeded
        }
    }

    return rtlCount / totalCount > 0.5; // Fallback to ratio check
}


function showPage(page) {
  console.log("displaying page in " + chosen_font + "...");
  background(242, 222, 189);
  applyWeatheredEffect();
  chosen_font = random(fonts);
  textFont(chosen_font);
  noStroke();
  
  let [meta, page_content] = page;
  if(hasEnoughLexicographicCharacters(page_content)){
    page_content = wrapChineseText(page_content, width - 40);
    page_content = page_content.replace(/(?:\s*\n\s*){3,}/g, '\n\n');
  }

  // content
  fill(random(0, 30), random(220,255));
  if(isMostlyRTL(page_content)){
    textAlign(RIGHT, TOP);
  } else {
    textAlign(LEFT, TOP);
  }
  let this_size = adjustFontSize(page_content, width - 40, 15, 12);//12);
  textSize(this_size);
  let posx_shift = (random(10) - 5);
  let posy_shift = (random(10) - 5);
  //textSize(12);
  text(page_content, 20 + posx_shift, 20 + posy_shift, width - 40 + (random(10) - 5), height - 90 + (random(10) - 5));
  
  // meta data if exists
  this_size = adjustFontSize(meta, width - 40, 10, 9);
  textSize(this_size);
  textAlign(RIGHT, TOP);
  text(meta, 20 + (random(10) - 5), height - 64 + (random(10) - 5), width - 40 + (random(10) - 5), 90 + (random(10) - 5));
  textAlign(LEFT, TOP);
  
  // page numbers
  //??
}

let lastClickTime = 0;
const debounceDelay = 80;
function mousePressed() {
  let currentTime = millis();
  if (currentTime - lastClickTime > debounceDelay) {
    lastClickTime = currentTime;
  } else {
    return ;
  }
  
  console.log("index:", dex, "buffered:", buffer.length);
  if (state === 2) {
    if (dex + 1 === buffer.length || state === 0) {
      //showPage(buffer[dex]);
    } else {
      showPage(buffer[dex]);
      dex++;
    }
  }
}

async function addToBuffer() {
  console.log("adding to buffer...");
  let page = await getPage();
  buffer.push(page);
}
