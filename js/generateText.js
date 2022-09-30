let customSelection = false;
let selectedSpan;
let relatedSpans;
let customPrompt;
const selectedSpanColor = "rgb(205,101,188)";
const CUSTOMFIELDLENGTH = 200;
//Boolean for whether or not Autosuggest is selected
let autosuggest = true;
//Boolean for whether or not toggles are supposed to be hidden
//Global index to help the cached toggle states
let showAllToggles = true;
//Cache for autosuggest
let groupedCustoms;

//Keyloger global function
let keyLogger = function(e) {
    //Default appears to toggle the autosuggest when space is entered for some reason
    e.preventDefault();
    if (customSelection == true) {
        if (e.key == "Enter") {
            customKeyListener("\n");
        } else if (e.key == "Escape") {
            for (let customIndex = 0; customIndex < relatedSpans.length; customIndex += 1) {
                relatedSpans[customIndex].style.color = "";
            }
            customSelection = false;
        } else {
            customKeyListener(e.key);
        }
    }
};
const FIELDLENGTH = 20;



document.addEventListener('DOMContentLoaded', restart);

function restart (){
    document.getElementById("generated-text").innerHTML = "";
    document.getElementById("generator-control-panel").innerHTML = "";

    if (sessionStorage.parsedTemplate !== undefined) {
        const parsedSegments = JSON.parse(String.raw`${sessionStorage.parsedTemplate}`);
        const parentNode = document.getElementById("generated-text");
        parentNode.className += "plain-text";
        groupedCustoms = new Map();
        initializeText(parentNode, parsedSegments);
        document.addEventListener('keydown', keyLogger);
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
        document.getElementById("show-hide-toggle-button").innerText = "toggles: hidden";
    } else {
        if (sessionStorage.showAllToggles === "true") {
            showAllToggles = true;
            document.getElementById("show-hide-toggle-button").innerText = "toggles: shown";
        } else {
            showAllToggles = false;
            document.getElementById("show-hide-toggle-button").innerText = "toggles: hidden";
        }
    }

}

function customKeyListener(key) {
    if (key === "Backspace") {
        if (selectedSpan.textContent !== customPrompt) {
            if (selectedSpan.textContent.length > 0) {
                selectedSpan.textContent = selectedSpan.textContent.substring(0, selectedSpan.textContent.length-1);
            }
            if (selectedSpan.textContent.length == 0) {
                selectedSpan.textContent = customPrompt;
            }
            const updatedTextContent = selectedSpan.textContent;
            if (autosuggest) {
                for (let customIndex = 0; customIndex < relatedSpans.length; customIndex += 1) {
                    relatedSpans[customIndex].textContent = updatedTextContent;
                }
            }
        }
    } else if (key.length == 1) {
        if (selectedSpan.textContent === customPrompt) {
            selectedSpan.textContent = key;
        } else {
            selectedSpan.textContent += key;
        }
        const updatedTextContent = selectedSpan.textContent;
        if (autosuggest) {
            for (let customIndex = 0; customIndex < relatedSpans.length; customIndex += 1) {
                relatedSpans[customIndex].textContent = updatedTextContent;
            }
        }
    }

}

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
                span.addEventListener("click", function() {
                    if (customSelection) {
                        for (let customIndex = 0; customIndex < relatedSpans.length; customIndex += 1) {
                            relatedSpans[customIndex].style.color = "";
                        }
                    }
                    customSelection = true;
                    selectedSpan = span;
                    customPrompt = parsedSegments[i].text;
                    relatedSpans = groupedCustoms.get(parsedSegments[i].text);
                    if (autosuggest) {
                        for (let customIndex = 0; customIndex < relatedSpans.length; customIndex += 1) {
                            relatedSpans[customIndex].style.color = selectedSpanColor;
                        }
                    } else {
                        selectedSpan.style.color = selectedSpanColor;
                    }
                });
                break;
            //Toggle text
            case 2:
                span.className = "toggle-text clickable";
                span.textContent = parsedSegments[i].text;
                let toggleState = 1;
                span.addEventListener("click", function() {
                    if (toggleState == 1) {
                        toggleState = 0;
                        if (!showAllToggles) {
                            hideToggles();
                        }
                    } else {
                        toggleState = 1;
                        span.className = "toggle-text clickable";
                    }
                });
                span.addEventListener("mouseenter", function(){
                    if (toggleState == 1) {
                        span.className = "toggle-text clickable excluded-toggle";
                    } else {
                        span.className = "toggle-text clickable";
                    }
                });
                span.addEventListener("mouseleave", function(){
                    if (toggleState == 1) {
                        span.className = "toggle-text clickable";
                    } else {
                        span.className = "toggle-text clickable excluded-toggle";
                    }
                });

                // });
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
    console.log(arguments.callee.caller);
    if (autosuggest) {
        autosuggest = false;
        sessionStorage.setItem("autosuggest", "false");
        autosuggestButton.innerText = "autoapply: off";
        //If autoapply is turned off, remove all colors
        for (let customIndex = 0; customIndex < relatedSpans.length; customIndex += 1) {
            relatedSpans[customIndex].style.color = "";
        }
        //If editing a custom, leave the selected span's color unchanged
        if (customSelection) {
            selectedSpan.style.color = selectedSpanColor;
        }
    } else {
        autosuggest = true;
        sessionStorage.setItem("autosuggest", "true");
        autosuggestButton.innerText = "autoapply: on";
        //If autoapply is turned on while editing a custom, update all the colors
        if (customSelection) {
            const updatedTextContent = selectedSpan.textContent;
            for (let customIndex = 0; customIndex < relatedSpans.length; customIndex += 1) {
                relatedSpans[customIndex].style.color = selectedSpanColor;
                relatedSpans[customIndex].textContent = updatedTextContent;
            }
        }
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
        showHideToggleButton.innerText = "toggles: hidden";
        hideToggles();
    } else {
        showAllToggles = true;
        sessionStorage.setItem("showAllToggles", "true");
        showHideToggleButton.innerText = "toggles: shown";
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
        showHideToggleButton.innerText = "toggles: shown";
    } else {
        showHideToggleButton.innerText = "toggles: hidden";
    }
});

//Return to Template page (go back button)
const returnToTemplateButton = document.getElementById("return-to-template");
returnToTemplateButton.addEventListener("click", returnToTemplate);
function returnToTemplate() {
    window.open("index.html", "_self");
}


document.getElementById("download-button").addEventListener("click", download);

function download() {
    document.removeEventListener("keydown", keyLogger);
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

document.getElementById("restart-button").addEventListener("click", restart);