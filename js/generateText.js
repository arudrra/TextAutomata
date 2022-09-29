var customSelection = false;
CUSTOMFIELDLENGTH = 200;

document.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.parsedTemplate !== undefined) {
        const parsedSegments = JSON.parse(String.raw`${sessionStorage.parsedTemplate}`);
        const parentNode = document.getElementById("generated-text");
        parentNode.className += "plain-text";

        initializeText(parentNode, parsedSegments);
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
                        //Autosuggest implemented here
                        // if (autosuggest && cache.has(segments[segmentIndex].prompt) && segments[segmentIndex].span.textContent == segments[segmentIndex].prompt) {
                        //     segments[segmentIndex].span.textContent = cache.get(segments[segmentIndex].prompt);
                        // } 
                        // customInputBox.setAttribute("placeholder", segments[segmentIndex].prompt);
                        customInputBox.setAttribute("line-height", 1);
                        // Don't need a max height since we have a max char
                        // var heightLimit = 200; /* Maximum height: 200px */
                        customInputBox.oninput = function() {
                            customInputBox.style.height = ""; /* Reset the height*/
                        //   input.style.height = Math.min(input.scrollHeight, heightLimit) + "px";
                            customInputBox.style.height = customInputBox.scrollHeight + "px";
                            span.textContent = customInputBox.value.substring();
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


