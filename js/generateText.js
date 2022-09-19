//Globals
let ParsedText;
// let currentText;
// let previousActions;
// let remainingSegments;

//Return to Template page (go back button)
const returnToTemplateButton = document.getElementById("return-to-template");
returnToTemplateButton.addEventListener("click", returnToTemplate);
function returnToTemplate() {
    window.open("template.html", "_self");
}

//Loads template from storage
function load() {
    ParsedText = new Object();
    ParsedText.segments = JSON.parse(localStorage.parsedTemplate);
    ParsedText.index = 0;
}


function toggleDecision() {
    const generatedTextArea = document.getElementById("generated-text");
    generatedTextArea.innerHTML += '<span class="toggle-text">' + ParsedText.segments[ParsedText.index].text + '<span>';
    advanceToNextDecision();
}

function customDecision() {
    const generatedTextArea = document.getElementById("generated-text");
    // generatedTextArea.append('<span class="custom-text">' + ParsedText.segments[ParsedText.index].text + '<span>');
    span = document.createElement("span");
    span.className = "custom-text";
    span.textContent = ParsedText.segments[ParsedText.index].text;
    generatedTextArea.appendChild(span);
    ParsedText.index += 1;
    advanceToNextDecision();

}

function nestedToggleDecision() {
    const generatedTextArea = document.getElementById("generated-text");

    ParsedText.index += 1;
    // advanceToNextDecision();

}

function advanceToNextDecision() {
    const generatedTextArea = document.getElementById("generated-text");
    while (ParsedText.index < ParsedText.segments.length && ParsedText.segments[ParsedText.index].type == 0) {
        plainText = document.createTextNode(ParsedText.segments[ParsedText.index].text);
        generatedTextArea.appendChild(plainText);
        ParsedText.index += 1
    }
    if (ParsedText.index >= ParsedText.segments) {
        console.log("DONE")
    } else if (ParsedText.segments[ParsedText.index].type == 1) {
        customDecision();
    } else if (ParsedText.segments[ParsedText.index].type == 2) {
        toggleDecision();
    }
    //     switch (ParsedText.segments[ParsedText.index].type) {
    //         case 1:
    //             customDecision();
    //             break;
    //         case 2:
    //             toggleDecision();
    //             break;
    //         case 3:
    //             nestedToggleDecision();
    //             break;
    //         default:
    //             console.log("Template Formatting Error")
    //     }
    
}

const startButton = document.getElementById("start-button");
startButton.addEventListener("click", startGenerator);

function startGenerator() {
    load();
    // document.getElementById("generated-text").innerHTML = 'Hello <span class="custom-text">Arudrra</span>';
    advanceToNextDecision();
}