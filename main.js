const FIELDLENGTH = 15
const input = document.getElementById("main-input");
const toggleButton = document.getElementById("toggle-control-button");
toggleButton.addEventListener("click", createToggleSyntax);
const customButton = document.getElementById("custom-control-button");
customButton.addEventListener("click", createCustomSyntax);
const nameInputBox = document.getElementById("name-input");
const generateTextButton = document.getElementById("generate-text-button")
generateTextButton.addEventListener("click", parse)

function generate() {
    console.log(input.selectionStart +" " + input.selectionEnd);
    console.log(input.value.substring());
    input.value = "YEET";
}

// var heightLimit = 200; /* Maximum height: 200px */

// input.oninput = function() {
//   input.style.height = ""; /* Reset the height*/
// //   input.style.height = Math.min(input.scrollHeight, heightLimit) + "px";
//   input.style.height = input.scrollHeight + "px";
// };

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
    const name = nameInputBox.value.substring()
    if (input.selectionStart != input.selectionEnd) {
        const sections = splitOnSelection(text, input.selectionStart, input.selectionEnd);
        if (name.length > 0) {
            input.value = sections[0] + "<t id=" + name + ">" + sections[1] + "</t>" + sections[2];
        } else {
            input.value = sections[0] + "<t>" + sections[1] + "</t>" + sections[2];
        }
    } else {
        console.log("invalid toggle creation");
    }
}

function createCustomSyntax(){
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value.substring();
    const name = nameInputBox.value.substring()
    if (name.length > 0) {
        input.value = text.slice(0, start) + "<c id=" +name + ">" + text.slice(start);
    }else if (start != end) {
        if (end - start <= FIELDLENGTH) {
            const sections = splitOnSelection(text, start, end);
            input.value = sections[0] + "<c id=" +sections[1] + ">" + sections[2];
        } else {
            console.log("invalid custom creation");
        }
    } else {
        input.value = text.slice(0, start) + "<c>" + text.slice(start);
    }   
}

function parse(){
    print
    const text = input.value.substring();
    console.log(text.split("<"))
}