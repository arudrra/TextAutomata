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
    while (remainingSegments.length > 0 && remainingSegments[0].type == 0) {
        //sometimes, blank characters get appended
        const currentSegment = remainingSegments.shift();
        generatedTextArea.innerHTML = currentSegment.text;
        previousActions.push(currentSegment);
    }
    if (remainingSegments.length == 0) {
        console.log("DONE");
    } else if (remainingSegments[0].type == 1) {
        customDecision();
    } else if (remainingSegments[0].type == 2){
        toggleDecision();
    } else {
        console.log("Template Formatting Error")
    }
}

function toggleDecision() {
    
}

function customDecision() {

}

function nestedToggleDecision() {
    
}

const startButton = document.getElementById("start-button");
startButton.addEventListener("click", startGenerator);

function startGenerator() {
    load();
    advanceToNextDecision();
}