// CORS IS THE ISSUE - SELF HOST IS ONLY REAL WAY - EVEN IF DO CORS BYPASS PROXY THE GUTENBERG API WILL LIMIT YOU AT SOME POINT - OR PERHAPS WITH A MIRROR USE CORS BYPASS

let font;
let buffer = [];
let dex = 0;
let state = 0;
let maxQuery = 58000;
let blank = ["", ""];
let proxy = "https://winter-meadow-d6c5.tuniomurtaza.workers.dev/?url="; // replace with cloudlflare

function preload() {
    font = loadFont('LibreBaskerville-Regular.ttf');
}

function setup() {
    createCanvas(680, 900);
    frameRate(25);
    background(242, 222, 189);
    fill(0);
    textFont(font);
    textSize(16);
    getMaxQuery();
}

function draw() {
    switch (state) {
        case 0:
            background(242, 222, 189);
            text("loading...", 30, 30);
            if (frameCount % 10 === 0) {
                addToBuffer();
            }
            if (millis() > 15000) {
                state++;
            }
            break;
        case 1:
            background(242, 222, 189);
            text("Click to change the page; study the page well. You will never see it again...", 18, 30);
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
            maxQuery = int(text.substring(index + 7, index + 14).replace(/,/g, ""));
        }
    } catch (error) {
        console.error("Failed to fetch max query count", error);
    }
}

async function getBook(triedA = false, X = 0) {
    console.log("getting book...");
    let baseA = proxy + `https://www.gutenberg.org/files/${X}/${X}-0.txt`;
    let baseB = proxy + `https://www.gutenberg.org/cache/epub/${X}/pg${X}.txt`;
    let url = triedA ? baseB : baseA;

    if (!triedA) {
        X = int(random(1, maxQuery));
        url = proxy + `https://www.gutenberg.org/files/${X}/${X}-0.txt`;
    }

    try {
        let response = await fetch(url);
        let text = await response.text();
        if (text.includes("404 Not Found")) {
            return triedA ? getBook(false, 0) : getBook(true, X);
        }
        return text;
    } catch (error) {
        console.error("Failed to fetch book", error);
        return "Error retrieving book.";
    }
}

function getMeta(full) {
    console.log("getting metadata...");
    let lines = full.split("\n");
    let meta = "";
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes("Title:")) meta += line + " " + lines[i + 1].trim() + "\n";
        if (line.includes("Author:")) meta += line + ", ";
        if (line.includes("Release Date:")) {
            let parts = line.split(",");
            meta += (parts.length > 1 ? parts[1].trim() : parts[0].trim()) + "\n";
        }
        if (line.includes("Language:")) meta += line.trim() + "\n";
    }
    return meta.trim() ? meta : "NO META DATA \n\n no meta data \n\n no meta data";
}

function choosePart(full) {
    console.log("choosing page...");
    let showLines = 30;
    full = full.replace(/\n+/g, "\n");
    let lines = full.split("\n");
    let numLines = lines.length;
    let mark0 = int(random(30, numLines - 30));
    while (lines[mark0].trim() === "") mark0++;
    if (showLines + mark0 > numLines) showLines = numLines - mark0;
    return lines.slice(mark0, mark0 + showLines).join("\n");
}

async function getPage() {
    console.log("getting view...");
    let fullText = await getBook(false, 0);
    let parts = fullText.split("PROJECT GUTENBERG");
    let meta = getMeta(parts[0]);
    let part = choosePart(parts[1] || "").replace(/_/g, "");
    return [meta + "\n \n \n", part];
}

function fittedText(txt, posX, posY, fitX, fitY) {
    textSize(min(20, max(10, fitX / textWidth(txt))));
    text(txt, posX, posY, width - 60, height - 120);
}

function showPage(page) {
    console.log("displaying page...");
    background(242, 222, 189);
    let [meta, pageContent] = page;
    text(meta, 30, 28);
    fittedText(pageContent, 30, 90, width - 60, height - 120);
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
}
