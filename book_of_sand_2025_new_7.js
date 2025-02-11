/* jshint esversion: 8 */

// TUNIO 2025
// Book of Sands live on the internet
//
//
// To Do:
// Need more elegant fix for no metadata - just blank it?
// Chinese text rendering fix
// Ring buffer implement



let font;
let buffer = [];
//const BUFFER_SIZE = 50;
let dex = 0; // pointer to read
//let dexa = 0; // pointer to add
let state = 0;
let maxQuery = 58000;
let startup_wait_ms = 10000;
let blank = ["", ""];
let proxy = "https://winter-meadow-d6c5.tuniomurtaza.workers.dev/?url=";

// ring buffer
//const BUFFER_SIZE = 50;
//let buffer = new Array(BUFFER_SIZE).fill(null);  // Pre-allocate
//let dex = 0;
//let bufferIndex = 0;
//let bufferFilled = 0;
//let isAdding = false;  // Flag to prevent unnecessary calls

const fonts = [
  // Generic font families (always available)
  "sans-serif", "serif", "monospace", "fantasy", "system-ui",

  // Web-safe fonts
  "Arial", "Verdana", "Helvetica", "Tahoma", "Trebuchet MS", "Geneva",
  "Times New Roman", "Georgia", "Garamond", "Palatino Linotype", "Book Antiqua",
  "Courier New", "Lucida Console", "Monaco", "Consolas", "Courier", "Luminari", "Copperplate",

  // Windows default fonts
  "Segoe UI", "Calibri", "Cambria", "Candara", "Constantia", "Corbel",
  "Franklin Gothic Medium", "Microsoft Sans Serif",

  // macOS default fonts
  "San Francisco", "Gill Sans", "Optima", "American Typewriter",
  "Chalkboard", "Menlo", "Noteworthy", "Hoefler Text",

  // Linux common fonts
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
  getMaxQuery();
}

function draw() {  
  switch (state) {
  case 0:
    background(242, 222, 189);
    text("Loading...", 20, 20);
    if (frameCount % 10 === 0) {
      addToBuffer();
    }
    if (millis() > startup_wait_ms) {
      state++;
    }
    break;
  case 1:
    background(242, 222, 189);
    let start_text = "Click to change the page; study the page well. You will never see it again...";
    text(start_text, 18, 20, width - 40, height - 100);

    state++;
    break;
  case 2:
    if (frameCount % 10 === 0 && buffer.length - dex < 50) {
      addToBuffer();
    }
    if (frameCount % 250 === 0) {
      console.log("garbage_collection...");
      for (let i = 0; i + 1 < dex; i++) {
        buffer[i] = blank;
      }
    }
    break;
  }
}

async function getMaxQuery() {
  try {
    let response = await fetch(proxy + "https://www.gutenberg.org/ebooks/");
    let text = await response.text();
    let index = text.indexOf("offers");
    if (index !== -1) {
      maxQuery = int(text.substring(index + 7, index + 14).replace(/, /g, ""));
    }
  }
  catch (error) {
    console.error("Failed to fetch max query count", error);
  }
}

async function getBook(triedA = false, X = 0) {
  console.log("getting book...");
  if (!triedA) {
    X = int(random(1, maxQuery));
  }

  let baseA = proxy + `https://www.gutenberg.org/files/${X}/${X}-0.txt`;
  let baseB = proxy + `https://www.gutenberg.org/cache/epub/${X}/pg${X}.txt`;
  let url = triedA ? baseB : baseA;

  try {
    let response = await fetch(url);
    let text = await response.text();
    if (text.includes("404 Not Found")) {
      return triedA ? getBook(false, 0) : getBook(true, X);
    }
    text = text.replace(/(?:\s*\n\s*){3,}/g, '\n\n');

    return {text, X};  // Return both book text and its ID
  }
  catch (error) {
    console.error("Failed to fetch book", error);
    return {text:"Error retrieving book.", X};
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
  let mark0 = 0;
  if (numLines === 1){
    print(numLines);
    print(mark0);
    print("full retd");
    return full;//lines.slice(mark0, mark0 + showLines).join("\n");
  }
  mark0 = int(random(30, numLines - 30));
  while (lines[mark0].trim() === "") mark0++;
  if (showLines + mark0 > numLines) showLines = numLines - mark0;
  print(numLines);
  print(mark0);
  print("chosen");
  return lines.slice(mark0, mark0 + showLines).join("\n");
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
  let meta = getMeta(text); // Pass X to getMeta()

  if (meta.includes("NO META DATA")) {
    console.warn("No meta data found. Retrying...");
    return await getPage(retries - 1);
  }

  let parts = text.split("PROJECT GUTENBERG");
  let part = choosePart(parts[1] || "").replace(/_/g, "");
  
  if (part.includes("NO MTPAGEDATA!")) {
    console.warn("No text data found. Retrying...");
    return await getPage(retries - 1);
  }

  return [meta, part];
}

function wrapChineseText(str, maxWidth) {
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
    let alpha = random(10, 20);
    fill(139, 69, 19, alpha); // Brownish smudges
    noStroke();
    ellipse(x,y,random(width*1), random(height*1));
  }

  // Slight fading on edges
  for (let i = 0; i < 40; i++) {
    let fade = map(i, 0, 40, 50, 0);
    stroke(0, fade);
    line(i, 0, i, height);
    line(width - i, 0, width - i, height);
    line(0, i, width, i);
    line(0, height - i, width, height - i);
  }
  blendMode(BLEND);
  //filter(BLUR, 15); // OOF
}


function showPage(page) {
  console.log("displaying page...");
  background(242, 222, 189);
  applyWeatheredEffect();
  let chosen_font = random(fonts);
  print("we chose: " + chosen_font);
  textFont(chosen_font);
  
  //noFill();
  //strokeWeight(3);
  //stroke(0);
  //rect(0, 0, width, height);
  noStroke();
  
  let [meta, page_content] = page;
  if(meta.toLowerCase().includes("language: chinese".toLowerCase()) || meta.toLowerCase().includes("language: zh")){
    page_content = wrapChineseText(page_content, width - 40)
  }

  fill(random(0, 30));
  let this_size = adjustFontSize(page_content, width - 40, 15, 12);
  textSize(this_size);
  //textSize(12);
  text(page_content, 20, 20, width - 40, height - 90);
  
  this_size = adjustFontSize(meta, width - 40, 10, 9);
  textSize(this_size);
  textAlign(RIGHT, TOP)
  text(meta, 20, height - 64, width - 40, 90);
  textAlign(LEFT, TOP)
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
