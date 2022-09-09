const FIELDLENGTH = 15
// const generateButton = document.getElementById("drag-page")
const input = document.getElementById("main-input");
// const conditional = document.getElementById("conditional")
// generateButton.addEventListener("click", generate);
const toggleButton = document.getElementById("toggle-control-button");
toggleButton.addEventListener("click", createToggleSyntax);
const customButton = document.getElementById("custom-control-button");
customButton.addEventListener("click", createCustomSyntax);

function generate() {
    console.log(input.selectionStart +" " + input.selectionEnd);
    console.log(input.value.substring());
    input.value = "YEET";
}

var heightLimit = 200; /* Maximum height: 200px */

input.oninput = function() {
  input.style.height = ""; /* Reset the height*/
//   input.style.height = Math.min(input.scrollHeight, heightLimit) + "px";
  input.style.height = input.scrollHeight + "px";
};

//Splits 
function splitOnSelection(text, start, end){
    var prefix = text.slice(0,start);
    var middle = text.slice(start, end);
    var suffix = text.slice(end);
    return [prefix, middle, suffix];
}

function createToggleSyntax(){
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value.substring();
    if (input.selectionStart != input.selectionEnd) {
        const sections = splitOnSelection(text, input.selectionStart, input.selectionEnd);
        input.value = sections[0] + "<t>" + sections[1] + "</t>" + sections[2];
    } else {
        console.log("invalid toggle creation");
    }
}

function createCustomSyntax(){
    console.log("registered")
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value.substring();
    if (start != end) {
        if (end - start <= FIELDLENGTH) {
            const sections = splitOnSelection(text, start, end);
            input.value = sections[0] + "<c id=" +sections[1] + ">" + sections[2];
        } else {
            console.log("invalid custom creation");
        }
    } else {
        input.value = text.slice(0, start) + "<c>" + text.slice(start)
    }
    
}