document.addEventListener('DOMContentLoaded', function() {
    if (parsedTemplate.autosuggest !== undefined) {
        const parsedSegments = JSON.parse(String.raw`${sessionStorage.parsedTemplate}`);
        const parentNode = document.getElementById("generated-text");
        initializeText(parentNode, parsedSegments);
    }
});

function initializeText(parentNode, parsedSegments) {
    for (let i = 0; i < parsedSegments.length; i++) {
        span = document.createElement("span");
        //spans should be invisible until the user reaches that point in the text
        parentNode.appendChild(span);
        switch (parsedSegments[i].type) {
            //Plain text
            case 0:
                span.className = "plain-text";
                span.textContent = parsedSegments[i].text;
                break;
            //Custom text
            case 1:
                span.className = "custom-text";
                span.textContent = parsedSegments[i].text;
                break;
            //Toggle text
            case 2:
                span.className = "toggle-text";
                segment.span.textContent = parsedSegments[i].text;
                break;
            //Nested text
            case 3:
                span.className = "nested-text";
                //Special case occurs here (for DOM nesting)
                initializeText(segment.span, parsedSegments[i].parsedNesting, i);
                break;
        }
    }
}