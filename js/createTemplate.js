//Constants for markdown and custom prompt length
const FIELDLENGTH = 20;
const CUSTOMSTART= '{';
const CUSTOMEND= '}';
const TOGGLESTART = '[';
const TOGGLEEND = ']';

//Input box contains template (used by most functions)
const input = document.getElementById("main-input");

// const nameInputBox = document.getElementById("name-input");
const originalControlPanel = document.getElementById("control-buttons");

//Loads template from session storage when the page is loaded
document.addEventListener("DOMContentLoaded", function() {
    if (sessionStorage.parsedTemplate !== undefined) {
        rawTemplate = JSON.parse(sessionStorage.rawTemplate);
        input.value = rawTemplate;
    }
  });

//Saves the the raw template before the page moves elsewhere
window.onbeforeunload = function() {
    sessionStorage.setItem("rawTemplate", JSON.stringify(input.value));
}

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

    const originalControlPanel = document.getElementById("control-buttons");
    //Control panel for custom input
    //Make div for control panel
    const customControlPanel = document.createElement('div');
    customControlPanel.setAttribute("id", "control-custom-buttons");
    //Make the back button
    const customBackButton = document.createElement('button');
    customBackButton.className = "bar-button left-control-button";
    customBackButton.innerText = "go back";
    customBackButton.addEventListener("click", function(){
        customControlPanel.replaceWith(originalControlPanel);
        input.removeAttribute("readonly");
        input.focus();
    });
    //Make the textbox for the name of the custom (the user will be prompted with later)
    const customNameInput = document.createElement('input');
    customNameInput.setAttribute("id", "name-input");
    customNameInput.setAttribute("maxlength",FIELDLENGTH);
    customNameInput.setAttribute("placeholder","enter filename");
    //Make the finish button
    const customFinishInputButton = document.createElement('button');
    customFinishInputButton.className = "bar-button right-control-button";
    customFinishInputButton.innerText = "finish";
    customFinishInputButton.addEventListener("click", function() {
        //Download functionality
        const templateText = input.value.substring();
        const downloadTemplate = document.createElement('a');
        downloadTemplate.href = "data:text/plain," + templateText;
        downloadTemplate.download = customNameInput.value.substring();
        document.body.appendChild(downloadTemplate);
        downloadTemplate.click();
        document.body.removeChild(downloadTemplate);
        downloadTemplate.remove();

        //Swap navigation bar back
        customControlPanel.replaceWith(originalControlPanel);
        customBackButton.remove();
        customNameInput.remove();
        customFinishInputButton.remove();
        customControlPanel.remove();
        input.removeAttribute("readonly");
        input.focus();
    });
    //Append all the buttons to the main div
    customControlPanel.appendChild(customBackButton);
    customControlPanel.appendChild(customNameInput);
    customControlPanel.appendChild(customFinishInputButton);

    originalControlPanel.replaceWith(customControlPanel);
    input.focus();
    input.setAttribute("readonly", true);


    // const templateText = input.value.substring();
    // const downloadTemplate = document.createElement('a');
    // downloadTemplate.href = "data:text/plain," + templateText;
    // downloadTemplate.download = "textAutomataTemplate";
    // document.body.appendChild(downloadTemplate);
    // downloadTemplate.click();
    // document.body.removeChild(downloadTemplate);
    
}

//Splits 
function splitOnSelection(text, start, end){
    var prefix = text.slice(0,start);
    var middle = text.slice(start, end);
    var suffix = text.slice(end);
    return [prefix, middle, suffix];
}

//Adds a wrapping end character (bracket or brace)
function addWrappingCharacter(start, end, text, closingCharacter) {
    if (end == text.length) {
        input.value = text + closingCharacter;
        input.setSelectionRange(end, end);
    } else {
        const sections = splitOnSelection(text, start, end);
        input.value = sections[0] +  closingCharacter + sections[2];
        input.setSelectionRange(sections[0].length, sections[0].length);
    }
}

//Automatically close braces and brackets
input.addEventListener("keydown", function(e) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value.substring();
    if (start === end) {
        if (e.key === TOGGLESTART) {
            addWrappingCharacter(start, end, text, TOGGLEEND);
        } else if (e.key === CUSTOMSTART) {
            addWrappingCharacter(start, end, text, CUSTOMEND);
        }
    } else {
        if (e.key === TOGGLESTART) {
            e.preventDefault();
            const sections = splitOnSelection(text, start, end);
            input.value = sections[0] + TOGGLESTART + sections[1] + TOGGLEEND + sections[2];
            const endOfSelection = sections[0].length + 1 + sections[1].length + 1;
            input.setSelectionRange(endOfSelection, endOfSelection);
        } else if (e.key === CUSTOMSTART) {
            e.preventDefault();
            const sections = splitOnSelection(text, start, end);
            input.value = sections[0] + CUSTOMSTART + sections[1] + CUSTOMEND + sections[2];
            const endOfSelection = sections[0].length + 1 + sections[1].length + 1;
            input.setSelectionRange(endOfSelection, endOfSelection);        
        }
    }
});

//Toggle Button and syntax insertion
const toggleButton = document.getElementById("toggle-control-button");
toggleButton.addEventListener("click", createToggleSyntax);
function createToggleSyntax(){
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value.substring();
    if (start != end) {
        const sections = splitOnSelection(text, start, end);
        input.value = sections[0] + TOGGLESTART + sections[1] + TOGGLEEND + sections[2];
        input.focus();
        const endOfSelection = sections[0].length + 1 + sections[1].length + 1;
        input.setSelectionRange(endOfSelection, endOfSelection);
    } else {
        console.log("invalid toggle creation");
    }
}


//Custom Button, navigation bar swapper, and syntax insertion
const customButton = document.getElementById("custom-control-button");
customButton.addEventListener("click", createCustomSyntax);
function createCustomSyntax(){
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value.substring();
    if (start != end) {
        if (end - start <= FIELDLENGTH) {
            const sections = splitOnSelection(text, start, end);
            input.value = sections[0] + CUSTOMSTART +sections[1] + CUSTOMEND + sections[2];
            input.focus();
            const endOfSelection = sections[0].length + 1 + sections[1].length + 1;
            input.setSelectionRange(endOfSelection, endOfSelection);
        } else {
            console.log("invalid custom creation");
        }
    } else {
        const originalControlPanel = document.getElementById("control-buttons");

        //Control panel for custom input
        //Make div for control panel
        const customControlPanel = document.createElement('div');
        customControlPanel.setAttribute("id", "control-custom-buttons");
        //Make the back button
        const customBackButton = document.createElement('button');
        customBackButton.className = "bar-button left-control-button";
        customBackButton.innerText = "go back";
        customBackButton.addEventListener("click", function(){
            customControlPanel.replaceWith(originalControlPanel);
            input.removeAttribute("readonly");
            input.focus();
        });
        //Make the textbox for the name of the custom (the user will be prompted with later)
        const customNameInput = document.createElement('input');
        customNameInput.setAttribute("id", "name-input");
        customNameInput.setAttribute("maxlength",FIELDLENGTH);
        customNameInput.setAttribute("placeholder","enter name");
        //Make the finish button
        const customFinishInputButton = document.createElement('button');
        customFinishInputButton.className = "bar-button right-control-button";
        customFinishInputButton.innerText = "finish";
        customFinishInputButton.addEventListener("click", function() {
            input.value = text.slice(0, start) +  CUSTOMSTART + customNameInput.value.substring() + CUSTOMEND + text.slice(start);
            customControlPanel.replaceWith(originalControlPanel);
            customBackButton.remove();
            customNameInput.remove();
            customFinishInputButton.remove();
            customControlPanel.remove();
            input.removeAttribute("readonly");
            input.focus();
            const endOfSelection = text.slice(0, start).length +  1 + customNameInput.value.substring().length + 1;
            input.setSelectionRange(endOfSelection, endOfSelection);
        });
        //Append all the buttons to the main div
        customControlPanel.appendChild(customBackButton);
        customControlPanel.appendChild(customNameInput);
        customControlPanel.appendChild(customFinishInputButton);

        originalControlPanel.replaceWith(customControlPanel);
        input.focus();
        input.setAttribute("readonly", true);
        
    }
        // if (name.length > 0) {
        //     input.value = text.slice(0, start) +  CUSTOMSTART +name + CUSTOMEND + text.slice(start);
        // }
    // } else {
    //     input.value = text.slice(0, start) + CUSTOMSTART + CUSTOMEND + text.slice(start);
    // }   
}



//There are 4 types of segments
//Type 0: normal text (does not need to be evaluated)
//Type 1: custom text (user will enter custom input later)
//Type 2: toggle text (user can toggle the text later)
//Type 3: toggle with 1 level of nested customs
function createNewSegment(type){
    segment = new Object();
    segment.text = "";
    segment.type = type;
    segment.generatedHTML = "";
    return segment;
}

function handleNestedToggles(segment) {
    let i = 0;
    let customActive = false;
    let segments = [];
    let text = segment.text;
    let currentSegment = createNewSegment(0);
    while (i < segment.text.length) {
        currentChar = text.charAt(i);
        if (currentChar == "\\") {
            i += 1;
            if (i < text.length) {
                currentSegment.text += text.charAt(i);
            }
        } else {
            if (currentChar == CUSTOMSTART && !customActive) {
                customActive = true;
                if (currentSegment.text.length > 0) segments.push(currentSegment);
                currentSegment = createNewSegment(1);
            } else if (currentChar == CUSTOMEND && customActive) {
                customActive = false;
                segments.push(currentSegment);
                currentSegment = createNewSegment(0);
            } else {
                currentSegment.text += currentChar;
            }
        }
        i += 1;
    }
    if (currentSegment.text.length > 0) segments.push(currentSegment);
    segment.parsedNesting = segments;
}

//Check to make sure that there is something in the input
function inputExists() {
    text = input.value.substring();
    if (text.length == 0) {
        alert("Template is empty. Please enter some text before continuing.");
        return false;
    }
    return true;
}

function containsDynamicInput(segments) {
    for (let i = 0; i < segments.length; i++) {
        if (segments[i].type != 0) {
            return true;
        }
    }
    alert("Template is does not have any toggles or variables. The current output will look exactly like the input. View the markdown using the preview button.");
    return false;
}

const parseButton = document.getElementById("parse-button");
//Parses the markdown and stores the markdown + raw input in local storage
parseButton.addEventListener("click", function() {
    if (inputExists()) {
        segments = parse();
        if (containsDynamicInput(segments)) {
            window.open("generate.html", "_self");
        }
    }
});

function parse(){
    const text = input.value.substring();
    let i = 0;
    let toggleActive = false;
    let customActive = false;
    let segments = [];
    let currentSegment = createNewSegment(0);
    while (i < text.length) {
        currentChar = text.charAt(i);
        //Check for  the escape character
        if (currentChar == "\\") {
            i += 1;
            if (i < text.length) {
                currentSegment.text += text.charAt(i);
            }
        } else {
            if (currentChar == CUSTOMSTART && !toggleActive && !customActive) {
                customActive = true;
                if (currentSegment.text.length > 0) segments.push(currentSegment);
                currentSegment = createNewSegment(1);
            } else if (currentChar == TOGGLESTART && !toggleActive && !customActive) {
                toggleActive = true;
                if (currentSegment.text.length > 0) segments.push(currentSegment);
                currentSegment = createNewSegment(2);
            } else if (currentChar == CUSTOMSTART && toggleActive && !customActive) {
                //Set as nested toggle (nested syntax is handled later)
                currentSegment.text += currentChar;
                currentSegment.type = 3;
            } else if (currentChar == CUSTOMEND && customActive) {
                customActive = false;
                segments.push(currentSegment);
                currentSegment = createNewSegment(0);
            } else if (currentChar == TOGGLEEND && toggleActive) {
                toggleActive = false;
                segments.push(currentSegment);
                currentSegment = createNewSegment(0);
            } else {
                currentSegment.text += currentChar;
            }
        }
        i += 1;
    }
    //Nested toggles are evaluated (similar to the parsing above)
    if (currentSegment.text.length > 0) segments.push(currentSegment);
    for (i = 0; i < segments.length; i++) {
        if (segments[i].type == 3) {
            handleNestedToggles(segments[i]);
        } 
    }
    sessionStorage.setItem("parsedTemplate", JSON.stringify(segments));
    return segments;
}

const previewButton = document.getElementById("preview-control-button");
previewButton.addEventListener("click", function() {
    if (inputExists()) {
        parse();
        window.open("preview.html", "_blank");
    }
});


const tutorialButton = document.getElementById("tutorial-button");
tutorialButton.addEventListener("click", function() {
    window.open("tutorial.html", "_blank");
});

const githubButton = document.getElementById("github-button");
githubButton.addEventListener("click", function() {
    window.open("https://github.com/arudrra/TextAutomata", "_blank");
});

const legacyButton = document.getElementById("legacy-button");
legacyButton.addEventListener("click", function() {
    if (inputExists()) {
        segments = parse();
        if (containsDynamicInput(segments)) {
            window.open("assemble.html", "_self");
        }
    }
});