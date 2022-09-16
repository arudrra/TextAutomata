const FIELDLENGTH = 15;

const CUSTOMSTART= '{';
const CUSTOMEND= '}';
const TOGGLESTART = '[';
const TOGGLEEND = ']';
const input = document.getElementById("main-input");
const toggleButton = document.getElementById("toggle-control-button");
toggleButton.addEventListener("click", createToggleSyntax);
const customButton = document.getElementById("custom-control-button");
customButton.addEventListener("click", createCustomSyntax);
const nameInputBox = document.getElementById("name-input");

//Import template functionality
const importButton = document.getElementById('upload');
importButton.addEventListener("change", importTemplate);
async function importTemplate() {
    input.value = await this.files[0].text();
}

//Download template functionality
const downloadTemplateButton = document.getElementById('download-template-button');
downloadTemplateButton.addEventListener("click", downloadTemplate);
function downloadTemplate() {
    console.log("yeet")
    var file = new Blob([input.value.substring()], {type: 'text/plain'});
    saveAs(file,"template.txt")
    // var template = document.createElement('template');
    // template.download = "template.txt";
    // template.href = window.URL.createObjectURL(file);
    // template.click();
    // // URL.revokeObjectURL(template.href);
    // template.remove();
    
}

// var heightLimit = 200; /* Maximum height: 200px */

// input.oninput = function() {
//   input.style.height = ""; /* Reset the height*/
// //   input.style.height = Math.min(input.scrollHeight, heightLimit) + "px";
//   input.style.height = input.scrollHeight + "px";
// };

//Splits 
function splitOnSelection(text, start, end){
    var prefix = text.slice(0,start);
    var middle = text.slice(start, end);
    var suffix = text.slice(end);
    return [prefix, middle, suffix];
}

function createToggleSyntax(){
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value.substring();
    const name = nameInputBox.value.substring()
    if (input.selectionStart != input.selectionEnd) {
        const sections = splitOnSelection(text, input.selectionStart, input.selectionEnd);
        if (name.length > 0) {
            input.value = sections[0] + TOGGLESTART + name + sections[1] + TOGGLEEND + sections[2];
        } else {
            input.value = sections[0] + TOGGLESTART +  sections[1] + TOGGLEEND + sections[2];
            console.log(JSON.stringify(input.value))
        }
    } else {
        console.log("invalid toggle creation");
    }
}

function createCustomSyntax(){
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value.substring();
    const name = nameInputBox.value.substring()
    if (name.length > 0) {
        input.value = text.slice(0, start) +  CUSTOMSTART +name + CUSTOMEND + text.slice(start);
    } else if (start != end) {
        if (end - start <= FIELDLENGTH) {
            const sections = splitOnSelection(text, start, end);
            input.value = sections[0] + CUSTOMSTART +sections[1] + CUSTOMEND + sections[2];
        } else {
            console.log("invalid custom creation");
        }
    } else {
        input.value = text.slice(0, start) + CUSTOMSTART + CUSTOMEND + text.slice(start);
    }   
}

const parseButton = document.getElementById("parse-button");
parseButton.addEventListener("click", parse);

function charInRange(index, end){
    if (index < end && index >= 0) {} 
}

//There are 3 types of segments
//Type 0: normal text (does not need to be evaluated)
//Type 1: custom text (user will enter custom input later)
//Type 2: toggle text (user can toggle the text later)
function createNewSegment(type){
    segment = new Object();
    segment.text = "";
    segment.type = type;
    return segment
}

function parse(){
    const text = input.value.substring();
    let i = 0;
    toggleActive = false;
    customActive = false;
    segments = []
    currentSegment = createNewSegment(0);
    while (i < text.length) {
        currentChar = text.charAt(i)
        //Check for  the escape character
        if (currentChar == "\\") {
            i += 1;
            if (i < text.length) {
                currentSegment.text += text.charAt(i);
            }
        } else {
            if (currentChar == CUSTOMSTART && !toggleActive && !customActive) {
                customActive = true;
                segments.push(currentSegment);
                currentSegment = createNewSegment(1);
            } else if (currentChar == TOGGLESTART && !toggleActive && !customActive) {
                toggleActive = true;
                segments.push(currentSegment);
                currentSegment = createNewSegment(2);
            } else if (currentChar == CUSTOMEND && customActive) {
                customActive = false;
                segments.push(currentSegment)
                currentSegment = createNewSegment(0);
            } else if (currentChar == TOGGLEEND && toggleActive) {
                toggleActive = false;
                segments.push(currentSegment)
                currentSegment = createNewSegment(0);
            } else {
                currentSegment.text += currentChar;
            }
        }
        i += 1
    }
    segments.push(currentSegment);
    console.log(segments);
    return segments;
}