//Globals
let currentText;
let previousActions;
let remainingSegments;

//Useful Elements
const generatedTextArea = document.getElementById("generated-text");

//Return to Template page (go back button)
const returnToTemplateButton = document.getElementById("return-to-template");
returnToTemplateButton.addEventListener("click", returnToTemplate);
function returnToTemplate() {
    window.open("template.html", "_self");
}

//Loads template from storage
function load() {
    currentText = [];
    previousActions = [];
    remainingSegments = JSON.parse(localStorage.parsedTemplate);
}

//Automatically adds text that does not require user decisions until it reaches a user decision
function advanceToNextDecision() {
    index = 0;
    while (index < remainingSegments.length && remainingSegments[index].type == 0) {
        //sometimes, blank characters get appended
        generatedTextArea.innerHTML = remainingSegments[index].text;
        index += 1;
    }
}

const startButton = document.getElementById("start-button");
startButton.addEventListener("click", startGenerator);

function startGenerator() {
    load();
    advanceToNextDecision();
}