//Globals
const CUSTOMFIELDLENGTH = 500;

//Boolean for whether or not Autosuggest is selected
let autosuggest = true;
//Cache for autosuggest
let cache = [];

//References to all the segment spans that are created in initialize text
//The array is flattened so we can go back and forward with nested toggles
let segmentSpans = [];

//Corresponds to segment spans, here is what it should look like for the different spans
//Plain text: [0] 
//custom text: [1, "key", "value"] 
//toggle text: [1, 0 or 1] depending on "on" (1) or "off" (0)
//segment toggle: [3, 0 or 1] depending on "on" (1) or "off" (0)
let segmentStates = []
let segmentIndex = 0;

let firstDecisionIndex = -1;
let lasttDecisionIndex = -1;

//Return to Template page (go back button)
const returnToTemplateButton = document.getElementById("return-to-template");
returnToTemplateButton.addEventListener("click", returnToTemplate);
function returnToTemplate() {
    window.open("template.html", "_self");
}


document.getElementById("restart-button").addEventListener("click", function(){
    document.getElementById("generated-text").replaceChildren();
    document.getElementById("generator-control-panel").replaceChildren();
    loadSegments();
    findDecisionEndpoints();
    moveNext();
});

/**
 * Loads segments from storage
 */
function loadSegments() {
    //String.raw necessary for firefox since \n is evaluated otherwise
    const segments = JSON.parse(String.raw`${sessionStorage.parsedTemplate}`);
    const parentNode = document.getElementById("generated-text");
    initializeText(parentNode, segments);
}

function findDecisionEndpoints() {
    let firstFound = false;
    for (let i = 0; i < segmentSpans.length; i++) {
        if (!firstFound && segmentStates[0] != 0) {
            firstFound = true;
            firstDecisionIndex = i;
        }
        lasttDecisionIndex = i;
    }
}

/**
 * Parses and places all the text into hidden spans at the beginning
 * @param parentNode - segments are appended as children to this node
 * @param segments - plain text, custom text, toggle text, or nested text
 * Special case - nested text requires 1 level of recursion where the original
 * span now becomes the parentNode
 */
function initializeText(parentNode, segments) {
    for (let i = 0; i < segments.length; i++) {
        //Text is broken into spans
        let span = document.createElement("span");
        //spans should be invisible until the user reaches that point in the text
        span.setAttribute("hidden", "hidden");
        parentNode.appendChild(span);
        switch (segments[i].type) {
            //Plain text
            case 0:
                span.className = "plain-text";
                span.textContent = segments[i].text;
                segmentSpans.push(span);
                segmentStates.push([0])
                break;
            //Custom text
            case 1:
                span.className = "custom-text";
                span.textContent = segments[i].text;
                segmentSpans.push(span);
                segmentStates.push([1, segments[i].text, segments[i].text])
                break;
            //Toggle text
            case 2:
                span.className = "toggle-text";
                span.textContent = segments[i].text;
                segmentSpans.push(span);
                segmentStates.push([2, 1])
                break;
            //Nested text
            case 3:
                span.className = "nested-text";
                segmentStates.push([3, 1]);
                //Special case occurs here (for DOM nesting)
                initializeText(span, segments[i].parsedNesting);
                break;
        }
    }
}


function inSegmentRange(indexToCheck) {
    return indexToCheck >= 0 && indexToCheck < segmentSpans.length
}

function makeDecisions() {
    switch (segmentStates[segmentIndex][0]) {
        //Custom text
        case 1:
            debugger;
            customDecision();
            break;
        //Toggle text
        case 2:
            toggleDecision();
            break;
        //Nested text
        case 3:
            makeDecisions();
            break;
    }
}

function moveNext() {
    while (inSegmentRange(segmentIndex) && segmentStates[segmentIndex][0] == 0) {
        if (segmentSpans[segmentIndex].hasAttribute("hidden")) {
            segmentSpans[segmentIndex].removeAttribute("hidden");
        }
        segmentIndex += 1;
    }
    if (inSegmentRange(segmentIndex)) {
        if (segmentSpans[segmentIndex].hasAttribute("hidden")) {
            segmentSpans[segmentIndex].removeAttribute("hidden");
        }
        makeDecisions();
    }
}

function moveBack() {
    while (inSegmentRange(segmentIndex) && segmentStates[segmentIndex][0] == 0) {
        segmentSpans[segmentIndex].setAttribute("hidden", "hidden");
        segmentIndex -= 1;
    }
    //Case for hitting back on the first choice where segmentIndex becomes negative
    if (segmentIndex <= 0) {
        segmentIndex = 0;
        moveNext();
    } else {
        makeDecisions();
    }
}

function customDecision() {
    const generatorControlPanel = document.getElementById("generator-control-panel");
    const customInterfacePanel = document.createElement("div");
    customInterfacePanel.setAttribute("id", "custom-interface-panel");
    customInterfacePanel.className = "generated-text-container";

    const customInputBox = document.createElement('textarea');
    customInputBox.setAttribute("id", "custom-input-box");
    customInputBox.setAttribute("maxlength",CUSTOMFIELDLENGTH);
    customInputBox.setAttribute("placeholder", segmentStates[segmentIndex][1]);
    customInputBox.setAttribute("line-height", 1);
    // Don't need a max height since we have a max char
    // var heightLimit = 200; /* Maximum height: 200px */
    customInputBox.oninput = function() {
        customInputBox.style.height = ""; /* Reset the height*/
    //   input.style.height = Math.min(input.scrollHeight, heightLimit) + "px";
        customInputBox.style.height = customInputBox.scrollHeight + "px";
        segmentSpans[segmentIndex].textContent = customInputBox.value.substring();

    };
    
    const bottomRowButtons = document.createElement('div');
    bottomRowButtons.className = "bottom-row-buttons";

    const nextButton = document.createElement('button');
    nextButton.className = "bar-button bottom-bar-button";
    nextButton.innerText = "next >";
    nextButton.addEventListener("click", function() {
        //Remove the interface for generating customs
        generatorControlPanel.removeChild(customInterfacePanel);
        generatorControlPanel.removeChild(bottomRowButtons);
        customInterfacePanel.removeChild(customInputBox);
        bottomRowButtons.removeChild(nextButton);
        bottomRowButtons.removeChild(backButton);
        customInterfacePanel.remove();
        bottomRowButtons.remove()
        customInputBox.remove();
        nextButton.remove();
        backButton.remove();
        //Cache response for autofill in the future
        // ParsedText.cache.set(ParsedText.segments[ParsedText.index].text, customInputBox.value.substring());
        // //Increase index
        // ParsedText.index += 1;
        // //Advance to next decision
        if (inSegmentRange(segmentIndex + 1)) {
            segmentIndex += 1;
            moveNext();
        } else {
            createFinishInterface();
        }
    })

    const backButton = document.createElement('button');
    backButton.className = "bar-button bottom-bar-button";
    backButton.innerText = "< back";
    if (segmentIndex != firstDecisionIndex) {
        backButton.addEventListener("click", function() {
            //Remove the interface for generating customs
            generatorControlPanel.removeChild(customInterfacePanel);
            generatorControlPanel.removeChild(bottomRowButtons);
            customInterfacePanel.removeChild(customInputBox);
            bottomRowButtons.removeChild(nextButton);
            bottomRowButtons.removeChild(backButton);
            customInterfacePanel.remove();
            bottomRowButtons.remove()
            customInputBox.remove();
            nextButton.remove();
            backButton.remove();
            if (inSegmentRange(segmentIndex - 1)) {
                segmentSpans[segmentIndex].setAttribute("hidden", "hidden");
                segmentIndex -= 1;
                moveBack();
            }
        });
    }
    bottomRowButtons.appendChild(backButton);
    bottomRowButtons.appendChild(nextButton);
    customInterfacePanel.appendChild(customInputBox);
    generatorControlPanel.appendChild(customInterfacePanel);
    generatorControlPanel.appendChild(bottomRowButtons);
}

//Creates the the toggle interface for the user to decide on a toggle
function toggleDecision() {
    if (segmentSpans[segmentIndex].hasAttribute("hidden")) {
        segmentSpans[segmentIndex].removeAttribute("hidden", "hidden");
    }
    const generatorControlPanel = document.getElementById("generator-control-panel");
    const toggleInterfacePanel = document.createElement("div");
    toggleInterfacePanel.setAttribute("id", "toggle-interface-panel");

    const backButton = document.createElement("button");
    backButton.className = "bar-button left-control-button back-button";
    backButton.innerText = "< back";
    if (segmentIndex != firstDecisionIndex) {
        backButton.addEventListener("click", function() {
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
            if (inSegmentRange(segmentIndex - 1)) {
                segmentSpans[segmentIndex].setAttribute("hidden", "hidden");
                segmentIndex -= 1;
                moveBack();
            }
        });
    }

    const toggleExclude = document.createElement("button")
    toggleExclude.className = "bar-button";
    toggleExclude.innerText = "exclude";
    toggleExclude.addEventListener("click", function() {
        segmentStates[segmentIndex][1] = 0;
        segmentSpans[segmentIndex].className = "toggle-text excluded-toggle";
    });
    //adds "hover" functionality where the toggle text disappears when hovering on the exclude button
    toggleExclude.addEventListener("mouseenter", function() {
        segmentSpans[segmentIndex].className = "toggle-text excluded-toggle";
    })
    toggleExclude.addEventListener("mouseleave", function() {
        if (segmentStates[segmentIndex][1] == 1) {
            segmentSpans[segmentIndex].className = "toggle-text";
        }
    })

    //back-button has the red hover color
    // toggleExclude.setAttribute("back-button");

    const toggleInclude = document.createElement("button")
    toggleInclude.className = "bar-button";
    toggleInclude.innerText = "include";
    toggleInclude.addEventListener("click", function() {
        segmentStates[segmentIndex][1] = 1;
        segmentSpans[segmentIndex].className = "toggle-text";
    });
    toggleInclude.addEventListener("mouseenter", function() {
        segmentSpans[segmentIndex].className = "toggle-text";
    });
    toggleInclude.addEventListener("mouseleave", function() {
        if (segmentStates[segmentIndex][1] == 0) {
            segmentSpans[segmentIndex].className = "toggle-text excluded-toggle";
        }
    });


    const nextButton = document.createElement('button');
    nextButton.className = "bar-button right-control-button next-button";
    nextButton.innerText = "next >";
    nextButton.addEventListener("click", function() {
        if (segmentStates[segmentIndex][1] == 0) {
            segmentSpans[segmentIndex].setAttribute("hidden", "hidden");
        }
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

        if (inSegmentRange(segmentIndex + 1)) {
            segmentIndex += 1;
            moveNext();
        } else {
            createFinishInterface();
        }
    })

    toggleInterfacePanel.appendChild(backButton);
    toggleInterfacePanel.appendChild(toggleExclude);
    toggleInterfacePanel.appendChild(toggleInclude);
    toggleInterfacePanel.appendChild(nextButton);
    generatorControlPanel.appendChild(toggleInterfacePanel);
}

function createFinishInterface() {

}