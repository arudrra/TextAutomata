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
    ParsedText.index = 0;
}

//Creates the the toggle interface for the user to decide on a toggle
function createToggleInterface(parent, child) {
    const generatorControlPanel = document.getElementById("generator-control-panel");
    const toggleInterfacePanel = document.createElement("div");
    toggleInterfacePanel.setAttribute("id", "toggle-interface-panel");

    const backButton = document.createElement("button");
    backButton.className = "bar-button left-control-button back-button";
    backButton.innerText = "< back";

    const toggleExclude = document.createElement("button")
    toggleExclude.className = "bar-button";
    toggleExclude.innerText = "exclude";
    toggleExclude.addEventListener("click", function() {
        if (parent.contains(child)) {
            parent.removeChild(child);
        }
    });
    //back-button has the red hover color
    // toggleExclude.setAttribute("back-button");

    const toggleInclude = document.createElement("button")
    toggleInclude.className = "bar-button";
    toggleInclude.innerText = "include";
    toggleInclude.addEventListener("click", function() {
        if (!parent.contains(child)) {
            parent.appendChild(child);
        }
    });

    const nextButton = document.createElement('button');
    nextButton.className = "bar-button right-control-button next-button";
    nextButton.innerText = "next >";
    nextButton.addEventListener("click", function() {
        //Remove the interface for toggling
        generatorControlPanel.removeChild(toggleInterfacePanel);
        toggleInterfacePanel.removeChild(backButton);
        toggleInterfacePanel.removeChild(toggleExclude);
        toggleInterfacePanel.removeChild(toggleInclude);
        toggleInterfacePanel.removeChild(nextButton);
        toggleInterfacePanel.remove();
        backButton.remove();
        toggleExclude.remove();
        toggleInclude.remove();
        nextButton.remove();
        //Advance to next decision
        advanceToNextDecision();
    })


    toggleInterfacePanel.appendChild(backButton);
    toggleInterfacePanel.appendChild(toggleExclude);
    toggleInterfacePanel.appendChild(toggleInclude);
    toggleInterfacePanel.appendChild(nextButton);
    generatorControlPanel.appendChild(toggleInterfacePanel);
    

}

//If the toggle is chosen
function toggleDecision() {
    const generatedTextArea = document.getElementById("generated-text");
    span = document.createElement("span");
    span.className = "toggle-text";
    span.textContent = ParsedText.segments[ParsedText.index].text;
    generatedTextArea.appendChild(span);
    ParsedText.index += 1;
    createToggleInterface(generatedTextArea, span);
    // advanceToNextDecision();
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