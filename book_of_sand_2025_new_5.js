/* jshint esversion: 8 */

// TUNIO 2025
// Book of Sands live on the internet
//
//
// To Do:
// Make the carousel algo work again, dont like growing array, even if u clean it up
// Find a cool font which is for all languages
//


let font;
let buffer = [];
let dex = 0;
let state = 0;
let maxQuery = 58000;
let startup_wait_ms = 10000;
let blank = ["", ""];
let proxy = "https://winter-meadow-d6c5.tuniomurtaza.workers.dev/?url=";

function setup() {
  let hh =  floor(windowHeight*0.9);
  let ww = floor(hh * (2.2 / 3));
  createCanvas(ww, hh);
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
    text("Loading...", 30, 30);
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
    text(start_text, 18, 30, width - 60, height - 100);

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

  for (let i = 0; i < lines.length / 5; i++) {
    let line = lines[i].trim();

    if (line.startsWith("Title:")) {
      meta += line + (lines[i + 1] ? " " + lines[i + 1].trim() : "") + "\n";
      foundTitle = true;
    }
    if (line.startsWith("Author:")) {
      meta += line + "\n";
    }
    if (line.startsWith("Release Date:")) {
      meta += line + "\n";
    }
    if (line.startsWith("Language:")) {
      meta += line + "\n";
    }
    if (foundTitle && meta.includes("Author:") && meta.includes("Release Date:") && meta.includes("Language:")) {
      break;
    }
  }

  return meta.trim() ? meta : "NO META DATA";
}




function choosePart(full) {
  console.log("choosing page...");
  let showLines = 45;
  full = full.replace(/\n+/g, "\n");
  let lines = full.split("\n");
  let numLines = lines.length;
  let mark0 = int(random(30, numLines - 30));
  while (lines[mark0].trim() === "") mark0++;
  if (showLines + mark0 > numLines) showLines = numLines - mark0;
  return lines.slice(mark0, mark0 + showLines).join("\n");
}


async function getPage(retries = 30) {
  if (retries <= 0) {
    console.error("Max retries reached. Unable to fetch book.");
    return ["Unable to fetch book.\n\n", "Unable to fetch book."];
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

  return [meta + "\n", part];
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
    testSize--; // Reduce font size until it fits
    textSize(testSize);
  }

  return testSize;
}

function showPage(page) {
  console.log("displaying page...");
  background(242, 222, 189);
  
  noFill();
  strokeWeight(3);
  stroke(0);
  rect(0, 0, width, height);
  noStroke();
  
  let [meta, page_content] = page;
  if(meta.toLowerCase().includes("language: chinese".toLowerCase()) || meta.toLowerCase().includes("language: zh")){
    page_content = wrapChineseText(page_content, width - 60)
  }

  fill(0);
  let this_size = adjustFontSize(page_content, width - 60, 14, 10);
  textSize(this_size);
  //textSize(12);
  text(page_content, 30, 30, width - 60, height - 100);
  textSize(8);
  textAlign(RIGHT, TOP)
  text(meta, 30, height - 64, width - 44, 90);
  textAlign(LEFT, TOP)
}

function mousePressed() {
  console.log("index:", dex, "buffered:", buffer.length);
  if (state === 2) {
    if (dex + 1 === buffer.length || state === 0) {
      showPage(buffer[dex]);
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
  //buffer.shift();
}
