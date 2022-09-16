document.addEventListener('DOMContentLoaded', generate);

const returnToTemplateButton = document.getElementById("return-to-template");
returnToTemplateButton.addEventListener("click", returnToTemplate);
function returnToTemplate() {
    window.open("template.html", "_self");
}

function generate() {
    alert("Ready!");
}