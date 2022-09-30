var customSelection = false;
const CUSTOMFIELDLENGTH = 200;
//Boolean for whether or not Autosuggest is selected
let autosuggest = true;
//Boolean for whether or not toggles are supposed to be hidden
let showAllToggles = true;
//Cache for autosuggest
let groupedCustoms;
//Cache for toggle
let toggleStates;


document.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.parsedTemplate !== undefined) {
        const parsedSegments = JSON.parse(String.raw`${sessionStorage.parsedTemplate}`);
        const parentNode = document.getElementById("generated-text");
        parentNode.className += "plain-text";
        groupedCustoms = new Map();
        toggleStates = new Map();
        initializeText(parentNode, parsedSegments);
    }

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

    //Set toggle button and global
    if (sessionStorage.showAllToggles === undefined) {
        showAllToggles = false;
        sessionStorage.setItem("showAllToggles", "false");
        document.getElementById("show-hide-toggle-button").innerText = "hide toggles: on";
    } else {
        if (sessionStorage.showAllToggles === "true") {
            showAllToggles = true;
            document.getElementById("show-hide-toggle-button").innerText = "hide toggles: off";
        } else {
            showAllToggles = false;
            document.getElementById("show-hide-toggle-button").innerText = "hide toggles: on";
        }
    }
});

function initializeText(parentNode, parsedSegments) {
    for (let i = 0; i < parsedSegments.length; i++) {
        const span = document.createElement("span");
        //spans should be invisible until the user reaches that point in the text
        parentNode.appendChild(span);
        switch (parsedSegments[i].type) {
            //Plain text
            case 0:
                span.textContent = parsedSegments[i].text;
                break;
            //Custom text
            case 1:
                span.className = "custom-text clickable";
                span.textContent = parsedSegments[i].text;
                if (groupedCustoms.has(parsedSegments[i].text)) {
                    groupedCustoms.get(parsedSegments[i].text).push(span);
                } else {
                    groupedCustoms.set(parsedSegments[i].text, [span]);
                }
                span.addEventListener("click", function(e) {
                    e.stopPropagation();
                    if (!customSelection) {
                        customSelection = true;
                        const generatorControlPanel = document.getElementById("generator-control-panel");
                        const customInterfacePanel = document.createElement("div");
                        customInterfacePanel.setAttribute("id", "custom-interface-panel");
                        customInterfacePanel.className = "generated-text-container";
                    
                        const customInputBox = document.createElement('textarea');
                        customInputBox.setAttribute("id", "custom-input-box");
                        customInputBox.setAttribute("maxlength",CUSTOMFIELDLENGTH);

                        customInputBox.setAttribute("placeholder", parsedSegments[i].text);
                        customInputBox.setAttribute("line-height", 1);
                        // Don't need a max height since we have a max char
                        // var heightLimit = 200; /* Maximum height: 200px */
                        customInputBox.oninput = function() {
                            customInputBox.style.height = ""; /* Reset the height*/
                        //   input.style.height = Math.min(input.scrollHeight, heightLimit) + "px";
                            customInputBox.style.height = customInputBox.scrollHeight + "px";
                            if (autosuggest) {
                                if (groupedCustoms.has(parsedSegments[i].text)) {
                                    for (let customIndex = 0; customIndex < groupedCustoms.get(parsedSegments[i].text).length; customIndex += 1) {
                                        groupedCustoms.get(parsedSegments[i].text)[customIndex].textContent = customInputBox.value.substring();
                                    }
                                }
                            } else {
                                span.textContent = customInputBox.value.substring();
                            }
                        };
                        const bottomRowButtons = document.createElement('div');
                        bottomRowButtons.className = "bottom-row-buttons";

                        const nextButton = document.createElement('button');
                        nextButton.className = "bar-button bottom-bar-button";
                        nextButton.innerText = "done";
                        nextButton.addEventListener("click", function() {
                            //Remove the interface for generating customs
                            generatorControlPanel.removeChild(customInterfacePanel);
                            generatorControlPanel.removeChild(bottomRowButtons);
                            customInterfacePanel.removeChild(customInputBox);
                            bottomRowButtons.removeChild(nextButton);
                            customInterfacePanel.remove();
                            bottomRowButtons.remove();
                            customInputBox.remove();
                            nextButton.remove();
                            //Cache response for autofill in the future
                            // cache.set(segments[segmentIndex].prompt, segments[segmentIndex].span.textContent);
                            customSelection = false;
                        })
                        bottomRowButtons.appendChild(nextButton);
                        customInterfacePanel.appendChild(customInputBox);
                        generatorControlPanel.appendChild(customInterfacePanel);
                        generatorControlPanel.appendChild(bottomRowButtons);
                    }
                });
                break;
            //Toggle text
            case 2:
                span.className = "toggle-text clickable";
                span.textContent = parsedSegments[i].text;
                span.addEventListener("click", function() {
                    if (!customSelection) {
                        if (span.className == "toggle-text clickable") {
                            span.className = "toggle-text clickable excluded-toggle";
                            if (!showAllToggles) {
                                hideToggles();
                            }
                        } else {
                            span.className = "toggle-text clickable";
                        }
                    }
                });
                break;
            //Nested text
            case 3:
                span.className = "nested-text clickable";
                span.addEventListener("click", function() {
                    if (!customSelection) {
                        if (span.className == "nested-text clickable") {
                            span.className = "nested-text clickable excluded-toggle";
                            if (!showAllToggles) {
                                hideToggles();
                            }
                        } else {
                            span.className = "nested-text clickable";
                        }
                    }
                });
                //Special case occurs here (for DOM nesting)
                initializeText(span, parsedSegments[i].parsedNesting);
                break;
        }
    }
}

function hideToggles() {
    const parentNode = document.getElementById("generated-text");
    const children = parentNode.children;
    for (let i = 0; i < children.length; i+= 1) {
        if (children[i].className == "nested-text clickable excluded-toggle" || children[i].className == "toggle-text clickable excluded-toggle") {
            children[i].setAttribute("hidden", "hidden");
        }
    }
}

function showToggles() {
    const parentNode = document.getElementById("generated-text");
    const children = parentNode.children;
    for (let i = 0; i < children.length; i+= 1) {
        if (children[i].hasAttribute("hidden")) {
            children[i].removeAttribute("hidden");
        }
    }
}

//Autofill toggle
const autosuggestButton = document.getElementById("auto-suggest-button");
autosuggestButton.addEventListener("click", function() {
    if (autosuggest) {
        autosuggest = false;
        sessionStorage.setItem("autosuggest", "false");
        autosuggestButton.innerText = "autoapply: off";
    } else {
        autosuggest = true;
        sessionStorage.setItem("autosuggest", "true");
        autosuggestButton.innerText = "autoapply: on";
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
        autosuggestButton.innerText = "autoapply: on";
    } else {
        autosuggestButton.innerText = "autoapply: off";
    }
});

//Toggle toggle
const showHideToggleButton = document.getElementById("show-hide-toggle-button");
showHideToggleButton.addEventListener("click", function() {
    if (showAllToggles) {
        showAllToggles = false;
        sessionStorage.setItem("showAllToggles", "false");
        showHideToggleButton.innerText = "hide toggles: on";
        hideToggles();
    } else {
        showAllToggles = true;
        sessionStorage.setItem("showAllToggles", "true");
        showHideToggleButton.innerText = "hide toggles: off";
        showToggles();
    }
});

//Toggle hover
showHideToggleButton.addEventListener("mouseenter", function() {
    if (showAllToggles) {
        showHideToggleButton.innerText = "click to hide";
    } else {
        showHideToggleButton.innerText = "click to show";
    }
});

showHideToggleButton.addEventListener("mouseleave", function() {
    if (showAllToggles) {
        showHideToggleButton.innerText = "hide toggles: off";
    } else {
        showHideToggleButton.innerText = "hide toggles: on";
    }
});

//Return to Template page (go back button)
const returnToTemplateButton = document.getElementById("return-to-template");
returnToTemplateButton.addEventListener("click", returnToTemplate);
function returnToTemplate() {
    window.open("index.html", "_self");
}