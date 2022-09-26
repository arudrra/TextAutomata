
//Globals
const CUSTOMFIELDLENGTH = 500;
const FIELDLENGTH = 20;

//Boolean for whether or not Autosuggest is selected
let autosuggest = true;
//Cache for autosuggest
let cache;

//References to all the segment spans that are created in initialize text
//The array is flattened so we can go back and forward with nested toggles
let segments = [];
let segmentIndex = 0;
let lastCachedDecisionIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    //Reset cache for autofill
    cache = new Map();
    //Set autofill button and global
    if (sessionStorage.autosuggest === undefined) {
        autosuggest = false;
        sessionStorage.setItem("autosuggest", "false");
        document.getElementById("auto-suggest-button").innerText = "autofill: off";
    } else {
        if (sessionStorage.autosuggest === "true") {
            autosuggest = true;
            document.getElementById("auto-suggest-button").innerText = "autofill: on";
        } else {
            autosuggest = false;
            document.getElementById("auto-suggest-button").innerText = "autofill: off";
        }
    }
    segmentIndex = 0;
    restart();
});

//Return to Template page (go back button)
const returnToTemplateButton = document.getElementById("return-to-template");
returnToTemplateButton.addEventListener("click", returnToTemplate);
function returnToTemplate() {
    window.open("template.html", "_self");
}

//Autofill toggle
const autosuggestButton = document.getElementById("auto-suggest-button");
autosuggestButton.addEventListener("click", function() {
    if (autosuggest) {
        autosuggest = false;
        sessionStorage.setItem("autosuggest", "false");
        autosuggestButton.innerText = "autofill: off";
    } else {
        autosuggest = true;
        sessionStorage.setItem("autosuggest", "true");
        autosuggestButton.innerText = "autofill: on";
    }
});

//Autofill hover
autosuggestButton.addEventListener("mouseenter", function() {
    if (autosuggest) {
        autosuggestButton.innerText = "click to turn off";
    } else {
        autosuggestButton.innerText = "click to turn on";
    }});

autosuggestButton.addEventListener("mouseleave", function() {
    if (autosuggest) {
        autosuggestButton.innerText = "autofill: on";
    } else {
        autosuggestButton.innerText = "autofill: off";
    }
});

document.getElementById("restart-button").addEventListener("click", restart);

function restart (){
    document.getElementById("generated-text").innerHTML = "";
    document.getElementById("generator-control-panel").innerHTML = "";
    cache = new Map();
    segmentIndex = 0;
    segments = []
    loadSegments();
    // // document.getElementById("generated-text").replaceChildren();
    // // document.getElementById("generator-control-panel").replaceChildren();
    while (segments[segmentIndex].type == 0) {
        if (segments[segmentIndex].span.hasAttribute("hidden")) { 
            segments[segmentIndex].span.removeAttribute("hidden");
        }
        segmentIndex += 1;
    }
    if (segments[segmentIndex].span.hasAttribute("hidden")) { 
        segments[segmentIndex].span.removeAttribute("hidden");
    }
    makeDecisions();
}

/**
 * Loads segments from storage
 */
function loadSegments() {
    //String.raw necessary for firefox since \n is evaluated otherwise
    const parsedSegments = JSON.parse(String.raw`${sessionStorage.parsedTemplate}`);
    const parentNode = document.getElementById("generated-text");
    const lastDecisionIndex = initializeText(parentNode, parsedSegments, -1);
    // set the last decision to be equal to the length (allow other function to recognize that)
    segments[lastDecisionIndex].nextDecision = segments.length;
}

/**
 * Parses and places all the text into hidden spans at the beginning
 * @param parentNode - segments are appended as children to this node
 * @param parsedSegments - plain text, custom text, toggle text, or nested text
 * Special case - nested text requires 1 level of recursion where the original
 * span now becomes the parentNode
 */
function initializeText(parentNode, parsedSegments, previousDecisionIndex) {
    for (let i = 0; i < parsedSegments.length; i++) {
        //Initialize segment object
        let segment = new Object();
        segments.push(segment);
        //Text is broken into spans
        segment.index = segments.length - 1;
        segment.span = document.createElement("span");
        //spans should be invisible until the user reaches that point in the text
        segment.span.setAttribute("hidden", "hidden");
        parentNode.appendChild(segment.span);
        switch (parsedSegments[i].type) {
            //Plain text
            case 0:
                segment.span.className = "plain-text";
                segment.span.textContent = parsedSegments[i].text;
                segment.type = 0;
                break;
            //Custom text
            case 1:
                segment.span.className = "custom-text";
                segment.span.textContent = parsedSegments[i].text;
                segment.type = 1;
                segment.prompt = parsedSegments[i].text;
                segment.value = parsedSegments[i].text;
                segment.previousDecision = previousDecisionIndex;
                if (previousDecisionIndex != -1) {
                    segments[previousDecisionIndex].nextDecision = segments.length-1;
                }
                previousDecisionIndex = segments.length-1;
                break;
            //Toggle text
            case 2:
                segment.span.className = "toggle-text";
                segment.span.textContent = parsedSegments[i].text;
                segment.type = 2;
                //toggle on = true, off = false
                segment.toggle = true;
                segment.previousDecision = previousDecisionIndex;
                if (previousDecisionIndex != -1) {
                    segments[previousDecisionIndex].nextDecision = segments.length-1;
                }
                previousDecisionIndex = segments.length-1;
                break;
            //Nested text
            case 3:
                segment.span.className = "nested-text";
                segment.type = 3; 
                segment.toggle = true;
                segment.previousDecision = previousDecisionIndex;
                //temporarily set in the event that this is the end
                segment.toggleVisibleIndex = -1
                if (previousDecisionIndex != -1) {
                    segments[previousDecisionIndex].nextDecision = segments.length-1;
                }
                previousDecisionIndex = segments.length-1;
                //Special case occurs here (for DOM nesting)
                const lastNestedDecisionIndex = initializeText(segment.span, parsedSegments[i].parsedNesting, i);
                //The end of the nested segment points back to the start toggle
                //For this case, we can get next by doing segments[nestedEndPointer].nextDecisionIndex
                segments[lastNestedDecisionIndex].nestedEndPointer = previousDecisionIndex;
                //link the first decision in the nesting as well (if the nesting is toggled visible)
                for (let tempIndex = previousDecisionIndex+1; tempIndex < segments.length; tempIndex++) {
                    if (segments[tempIndex].type != 0) {
                        segment.toggleVisibleIndex = tempIndex;
                        break;
                    }
                }
                break;
        }
    }
    return previousDecisionIndex;
}


function inSegmentRange(indexToCheck) {
    return indexToCheck >= 0 && indexToCheck < segmentSpans.length
}

function makeDecisions() {
    if (segmentIndex == -1 || segmentIndex >= segments.length ) {
        finishAndDownload();
    } else {
        switch (segments[segmentIndex].type) {
            //Custom text
            case 1:
                customDecision();
                break;
            //Toggle text
            case 2:
                toggleDecision();
                break;
            //Nested text
            case 3:
                nestedToggleDecision();
                break;
        }
    }
}

function finishAndDownload(){
    download();
};

//Makes a group of consecutive spans visible (inclusive)
function makeRangeVisible(start, end){
    for (let i = start; i <= end && i < segments.length; i++) {
        if (segments[i].span.hasAttribute("hidden")) {
            segments[i].span.removeAttribute("hidden");
        }
    }
}

//Makes a group of consecutive spans invisible (inclusive)
function makeRangeInvisible(start, end){
    for (let i = end; i >= start; i--) {
        segments[i].span.setAttribute("hidden", "hidden");
    }
}

function moveNext() {
    let start = segmentIndex + 1;
    let end = segments.length - 1;
    //Check for a nested end pointer
    if (segments[segmentIndex].hasOwnProperty("nestedEndPointer")) {
        end = segments[segments[segmentIndex].nestedEndPointer].nextDecision
    //Deal with the nested case
    } else if (segments[segmentIndex].type == 3) {
        //If the nested segment is visible (make everything until the first nested decision visible)
        if (segments[segmentIndex].toggle) {
            end = segments[segmentIndex].toggleVisibleIndex;
        //If the nested segment is hidden (make everything from the end of the first nested segment to the next decision visible)
        } else {
            end = segments[segmentIndex].nextDecision;
        }
    //Else deal with the normal case
    } else {
        end = segments[segmentIndex].nextDecision;
    }

    makeRangeVisible(start, end);
    lastCachedDecisionIndex = segmentIndex;
    segmentIndex = end;
    makeDecisions();
}

function moveBack() {
    let start = segments[segmentIndex].previousDecision + 1;
    let end = segmentIndex;
    makeRangeInvisible(start, end);
    segmentIndex = segments[segmentIndex].previousDecision;
    makeDecisions();
}

function customDecision() {
    const generatorControlPanel = document.getElementById("generator-control-panel");
    const customInterfacePanel = document.createElement("div");
    customInterfacePanel.setAttribute("id", "custom-interface-panel");
    customInterfacePanel.className = "generated-text-container";

    const customInputBox = document.createElement('textarea');
    customInputBox.setAttribute("id", "custom-input-box");
    customInputBox.setAttribute("maxlength",CUSTOMFIELDLENGTH);
    //Autosuggest implemented here
    if (autosuggest && cache.has(segments[segmentIndex].prompt) && segments[segmentIndex].span.textContent == segments[segmentIndex].prompt) {
        segments[segmentIndex].span.textContent = cache.get(segments[segmentIndex].prompt);
    } 
    customInputBox.setAttribute("placeholder", segments[segmentIndex].prompt);
    customInputBox.setAttribute("line-height", 1);
    // Don't need a max height since we have a max char
    // var heightLimit = 200; /* Maximum height: 200px */
    customInputBox.oninput = function() {
        customInputBox.style.height = ""; /* Reset the height*/
    //   input.style.height = Math.min(input.scrollHeight, heightLimit) + "px";
        customInputBox.style.height = customInputBox.scrollHeight + "px";
        segments[segmentIndex].span.textContent = customInputBox.value.substring();

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
        cache.set(segments[segmentIndex].prompt, segments[segmentIndex].span.textContent);
        // //Increase index
        // ParsedText.index += 1;
        // //Advance to next decision
        moveNext();
    })

    const backButton = document.createElement('button');
    backButton.className = "bar-button bottom-bar-button";
    backButton.innerText = "< back";
    if (segments[segmentIndex].previousDecision != -1) {
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
            moveBack();
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
    const generatorControlPanel = document.getElementById("generator-control-panel");
    const toggleInterfacePanel = document.createElement("div");
    toggleInterfacePanel.setAttribute("id", "toggle-interface-panel");

    const backButton = document.createElement("button");
    backButton.className = "bar-button left-control-button back-button";
    backButton.innerText = "< back";
    if (segments[segmentIndex].previousDecision != -1) {
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
            segments[segmentIndex].span.setAttribute("hidden", "hidden");
            moveBack();
        });
    }

    const toggleExclude = document.createElement("button")
    toggleExclude.className = "bar-button";
    toggleExclude.innerText = "exclude";
    toggleExclude.addEventListener("click", function() {
        segments[segmentIndex].toggle = false;
        segments[segmentIndex].span.className = "toggle-text excluded-toggle";
    });
    //adds "hover" functionality where the toggle text disappears when hovering on the exclude button
    toggleExclude.addEventListener("mouseenter", function() {
        segments[segmentIndex].span.className = "toggle-text excluded-toggle";
    })
    toggleExclude.addEventListener("mouseleave", function() {
        if (segments[segmentIndex].toggle) {
            segments[segmentIndex].span.className = "toggle-text";
        }
    })

    const toggleInclude = document.createElement("button")
    toggleInclude.className = "bar-button";
    toggleInclude.innerText = "include";
    toggleInclude.addEventListener("click", function() {
        segments[segmentIndex].toggle = true;
        segments[segmentIndex].span.className = "toggle-text";
    });
    toggleInclude.addEventListener("mouseenter", function() {
        segments[segmentIndex].span.className = "toggle-text";
    });
    toggleInclude.addEventListener("mouseleave", function() {
        if (!segments[segmentIndex].toggle) {
            segments[segmentIndex].span.className = "toggle-text excluded-toggle";
        }
    });


    const nextButton = document.createElement('button');
    nextButton.className = "bar-button right-control-button next-button";
    nextButton.innerText = "next >";
    nextButton.addEventListener("click", function() {
        if (!segments[segmentIndex].toggle) {
            segments[segmentIndex].span.setAttribute("hidden", "hidden");
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
        moveNext();
    })

    toggleInterfacePanel.appendChild(backButton);
    toggleInterfacePanel.appendChild(toggleExclude);
    toggleInterfacePanel.appendChild(toggleInclude);
    toggleInterfacePanel.appendChild(nextButton);
    generatorControlPanel.appendChild(toggleInterfacePanel);
}

function setAllChildrenVisibleAndAddToggleColor(segment) {
    children = segments[segmentIndex].span.children;
    for (let i = 0; i < children.length; i++) {
        if (children[i].hasAttribute("hidden")) {
            children[i].removeAttribute("hidden", "hidden");
        }
        if (children[i].className == "plain-text"){
            children[i].className = "";
        }
    }
}

function nestedToggleDecision() {
    if (segments[segmentIndex].span.hasAttribute("hidden")) {
        segments[segmentIndex].span.removeAttribute("hidden", "hidden");
    }
    const generatorControlPanel = document.getElementById("generator-control-panel");
    const toggleInterfacePanel = document.createElement("div");
    toggleInterfacePanel.setAttribute("id", "toggle-interface-panel");
    setAllChildrenVisibleAndAddToggleColor(segments[segmentIndex].span);

    const backButton = document.createElement("button");
    backButton.className = "bar-button left-control-button back-button";
    backButton.innerText = "< back";
    if (segments[segmentIndex].previousDecision != -1) {
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
            segments[segmentIndex].span.setAttribute("hidden", "hidden");
            moveBack();
        });
    }

    const toggleExclude = document.createElement("button")
    toggleExclude.className = "bar-button";
    toggleExclude.innerText = "exclude";
    toggleExclude.addEventListener("click", function() {
        segments[segmentIndex].toggle = false;
        segments[segmentIndex].span.className = "nested-text excluded-toggle";
    });
    //adds "hover" functionality where the toggle text disappears when hovering on the exclude button
    toggleExclude.addEventListener("mouseenter", function() {
        segments[segmentIndex].span.className = "nested-text excluded-toggle";
    })
    toggleExclude.addEventListener("mouseleave", function() {
        if (segments[segmentIndex].toggle) {
            segments[segmentIndex].span.className = "nested-text";
        }
    })

    const toggleInclude = document.createElement("button")
    toggleInclude.className = "bar-button";
    toggleInclude.innerText = "include";
    toggleInclude.addEventListener("click", function() {
        segments[segmentIndex].toggle = true;
        segments[segmentIndex].span.className = "nested-text";
    });
    toggleInclude.addEventListener("mouseenter", function() {
        segments[segmentIndex].span.className = "nested-text";
    });
    toggleInclude.addEventListener("mouseleave", function() {
        if (!segments[segmentIndex].toggle) {
            segments[segmentIndex].span.className = "nested-text excluded-toggle";
        }
    });


    const nextButton = document.createElement('button');
    nextButton.className = "bar-button right-control-button next-button";
    nextButton.innerText = "next >";
    nextButton.addEventListener("click", function() {
        if (!segments[segmentIndex].toggle) {
            segments[segmentIndex].span.setAttribute("hidden", "hidden");
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
        moveNext();
    })

    toggleInterfacePanel.appendChild(backButton);
    toggleInterfacePanel.appendChild(toggleExclude);
    toggleInterfacePanel.appendChild(toggleInclude);
    toggleInterfacePanel.appendChild(nextButton);
    generatorControlPanel.appendChild(toggleInterfacePanel);
}

//pass the appropriate filetypeFunction for the correct file extension
//e.g for a textfile: download("testing-arudrra", txtDownload) initiates txtDownload for a .txt extension
function download() {
    const generatedTextArea = document.getElementById("generated-text");
    let finalText = "";
    for (let i = 0; i < generatedTextArea.childNodes.length; i += 1) {
        //Spans are nodetype of 1 and spans with hidden attributes are ignored
        //Spans of nodetype 3 are just Text Nodes (unevaluated text from the template)
        if (generatedTextArea.childNodes[i].nodeType == 1 && !generatedTextArea.childNodes[i].hasAttribute("hidden")) {
            finalText += generatedTextArea.childNodes[i].innerText;
        } else if (generatedTextArea.childNodes[i].nodeType == 3) {
            finalText += generatedTextArea.childNodes[i].nodeValue;
        }
    }
    console.log(finalText);


    const originalControlPanel = document.getElementById("generate-control-buttons");
    //Control panel for custom input
    //Make div for control panel
    const customControlPanel = document.createElement('div');
    customControlPanel.setAttribute("id", "control-generate-download-buttons");
    //Make the back button
    const customRestartButton = document.createElement('button');
    customRestartButton.className = "bar-button left-control-button";
    customRestartButton.innerText = "restart";

    //Make the textbox for the name of the custom (the user will be prompted with later)
    const customNameInput = document.createElement('input');
    customNameInput.setAttribute("id", "name-input");
    customNameInput.setAttribute("maxlength",FIELDLENGTH);
    customNameInput.setAttribute("placeholder","enter filename");
    //Make the finish button
    const txtDownloadButton = document.createElement('button');
    txtDownloadButton.className = "bar-button";
    txtDownloadButton.innerText = "download";
    txtDownloadButton.addEventListener("click", function() {
        //Download functionality
        txtDownload(customNameInput.value, finalText);
    });

    const copyToClipboardButton = document.createElement('button');
    copyToClipboardButton.className = "bar-button right-control-button";
    copyToClipboardButton.innerText = "copy";
    copyToClipboardButton.addEventListener("click", function() {
        //Download functionality
        copyToClipboard(finalText);
    });

    //Append all the buttons to the main div
    customControlPanel.appendChild(customRestartButton);
    customControlPanel.appendChild(customNameInput);
    customControlPanel.appendChild(txtDownloadButton);
    customControlPanel.appendChild(copyToClipboardButton);
    originalControlPanel.replaceWith(customControlPanel);

    customRestartButton.addEventListener("click", function(){
        customControlPanel.replaceWith(originalControlPanel);
        customControlPanel.removeChild(customRestartButton);
        customControlPanel.removeChild(customNameInput);
        customControlPanel.removeChild(txtDownloadButton);
        customControlPanel.removeChild(copyToClipboardButton);
        customControlPanel.remove();
        customRestartButton.remove();
        customNameInput.remove();
        txtDownloadButton.remove();
        copyToClipboardButton.remove();
        restart();
    });
}


function txtDownload(filename, content) {
    //Download functionality
    const downloadTemplate = document.createElement('a');
    downloadTemplate.href = "data:text/plain," + content;
    downloadTemplate.download = filename;
    document.body.appendChild(downloadTemplate);
    downloadTemplate.click();
    document.body.removeChild(downloadTemplate);
    downloadTemplate.remove();
}

function copyToClipboard(content) {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(content);
    } else {
        console.log("clipboard unavailable");
    }
}