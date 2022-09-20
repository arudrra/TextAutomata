//Globals
let ParsedText;
CUSTOMFIELDLENGTH = 500;

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
    //1 means that the toggle is active, 0 means that it is inactive
    ParsedText.segments[ParsedText.index].state = 1;

    const backButton = document.createElement("button");
    backButton.className = "bar-button left-control-button back-button";
    backButton.innerText = "< back";

    const toggleExclude = document.createElement("button")
    toggleExclude.className = "bar-button";
    toggleExclude.innerText = "exclude";
    toggleExclude.addEventListener("click", function() {
        if (ParsedText.segments[ParsedText.index].state == 1) {
            ParsedText.segments[ParsedText.index].state = 0;
            parent.removeChild(child);
            child.className = "toggle-text";
        }    
    });
    //adds "hover" functionality where the toggle text disappears when hovering on the exclude button
    toggleExclude.addEventListener("mouseenter", function() {
        if (ParsedText.segments[ParsedText.index].state == 1) {
            child.className = "toggle-text excluded-toggle";
            // child.setAttribute("text-decoration", "line-through !important");
        }
    })
    toggleExclude.addEventListener("mouseleave", function() {
        if (ParsedText.segments[ParsedText.index].state == 1) {
            child.className = "toggle-text";
        }
    })

    //back-button has the red hover color
    // toggleExclude.setAttribute("back-button");

    const toggleInclude = document.createElement("button")
    toggleInclude.className = "bar-button";
    toggleInclude.innerText = "include";
    toggleInclude.addEventListener("click", function() {
        if (ParsedText.segments[ParsedText.index].state == 0) {
            ParsedText.segments[ParsedText.index].state = 1;
            parent.appendChild(child);
        }
    });
    //adds "hover" functionality where the toggle text appears when hovering on the include button
    // toggleInclude.addEventListener("mouseenter", function() {
    //     if (ParsedText.segments[ParsedText.index].state == 0) {
    //         parent.appendChild(child);
    //     }
    // })
    // toggleInclude.addEventListener("mouseleave", function() {
    //     if (ParsedText.segments[ParsedText.index].state == 0) {
    //         parent.removeChild(child);
    //     }
    // })

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
        //Increase index
        ParsedText.index += 1;
        //Advance to next decision
        advanceToNextDecision();
    })

    toggleInterfacePanel.appendChild(backButton);
    toggleInterfacePanel.appendChild(toggleExclude);
    toggleInterfacePanel.appendChild(toggleInclude);
    toggleInterfacePanel.appendChild(nextButton);
    generatorControlPanel.appendChild(toggleInterfacePanel);
}

function createCustomInterface(parent, child) {
    const generatorControlPanel = document.getElementById("generator-control-panel");
    const customInterfacePanel = document.createElement("div");
    customInterfacePanel.setAttribute("id", "custom-interface-panel");
    customInterfacePanel.className = "generated-text-container";

    const customInputBox = document.createElement('textarea');
    customInputBox.setAttribute("id", "custom-input-box");
    customInputBox.setAttribute("maxlength",CUSTOMFIELDLENGTH);
    customInputBox.setAttribute("placeholder", ParsedText.segments[ParsedText.index].text);
    //mirrors the custom input text onto the generated textbox
    // customInputBox.addEventListener("keyup", function() {
    //     child.textContent = customInputBox.value.substring();
    // })
    // customInputBox.addEventListener("keydown", function() {
    //     child.textContent = customInputBox.value.substring();
    // })
    // var heightLimit = 200; /* Maximum height: 200px */
    customInputBox.oninput = function() {
        customInputBox.style.height = ""; /* Reset the height*/
    //   input.style.height = Math.min(input.scrollHeight, heightLimit) + "px";
        customInputBox.style.height = customInputBox.scrollHeight + "px";
        child.textContent = customInputBox.value.substring();

    };

    const nextButton = document.createElement('button');
    nextButton.className = "bar-button right-control-button next-button";
    nextButton.innerText = "next >";
    nextButton.addEventListener("click", function() {
        //Remove the interface for generating customs
        generatorControlPanel.removeChild(customInterfacePanel);
        customInterfacePanel.removeChild(customInputBox);
        customInterfacePanel.removeChild(nextButton);
        customInterfacePanel.remove();
        customInputBox.remove();
        nextButton.remove();
        nextButton.remove();
        //Increase index
        ParsedText.index += 1;
        //Advance to next decision
        advanceToNextDecision();
    })

    customInterfacePanel.appendChild(customInputBox);
    customInterfacePanel.appendChild(nextButton);
    generatorControlPanel.appendChild(customInterfacePanel);
}

//If the toggle is chosen
function toggleDecision() {
    const generatedTextArea = document.getElementById("generated-text");
    span = document.createElement("span");
    span.className = "toggle-text";
    span.textContent = ParsedText.segments[ParsedText.index].text;
    generatedTextArea.appendChild(span);
    createToggleInterface(generatedTextArea, span);
}

function customDecision() {
    const generatedTextArea = document.getElementById("generated-text");
    // generatedTextArea.append('<span class="custom-text">' + ParsedText.segments[ParsedText.index].text + '<span>');
    span = document.createElement("span");
    span.className = "custom-text";
    span.textContent = ParsedText.segments[ParsedText.index].text;
    generatedTextArea.appendChild(span);
    createCustomInterface(generatedTextArea, span);

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
    document.getElementById("generated-text").innerHTML = "";
    document.getElementById("generator-control-panel").innerHTML = "";
    advanceToNextDecision();
}