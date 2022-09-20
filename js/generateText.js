//Globals
let ParsedText;

//Return to Template page (go back button)
const returnToTemplateButton = document.getElementById("return-to-template");
returnToTemplateButton.addEventListener("click", returnToTemplate);
function returnToTemplate() {
    window.open("template.html", "_self");
}

//Loads template from storage
function load() {
    ParsedText = new Object();
    //String.raw necessary for firefox since \n is evaluated otherwise
    ParsedText.segments = JSON.parse(String.raw`${sessionStorage.parsedTemplate}`);
    console.log(ParsedText);
    ParsedText.index = 0;
}


function toggleDecision() {
    //If the toggle is chosen
    const generatedTextArea = document.getElementById("generated-text");
    span = document.createElement("span");
    span.className = "toggle-text";
    span.textContent = ParsedText.segments[ParsedText.index].text;
    generatedTextArea.appendChild(span);
    ParsedText.index += 1;
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
    if (ParsedText.index >= ParsedText.segments.length) {
        console.log("DONE")
    } else if (ParsedText.segments[ParsedText.index].type == 1) {
        customDecision();
    } else if (ParsedText.segments[ParsedText.index].type == 2) {
        toggleDecision();
    }
}

const startButton = document.getElementById("restart-button");
startButton.addEventListener("click", startGenerator);

function startGenerator() {
    load();
    advanceToNextDecision();
}