// const generateButton = document.getElementById("drag-page")
const input = document.getElementById("main-input")
// const conditional = document.getElementById("conditional")
// generateButton.addEventListener("click", generate);

function generate() {
    console.log(input.selectionStart +" " + input.selectionEnd)
    console.log(input.value.substring())
    input.value = "YEET"
}

var heightLimit = 200; /* Maximum height: 200px */

input.oninput = function() {
  input.style.height = ""; /* Reset the height*/
//   input.style.height = Math.min(input.scrollHeight, heightLimit) + "px";
  input.style.height = input.scrollHeight + "px";
};