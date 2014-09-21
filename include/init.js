
// Save command override.
CodeMirror.commands.save = function() {
  alert("saved.");
};

// Initialize vim.
var editor = CodeMirror.fromTextArea(document.getElementById("vim"), {
  lineNumbers: true,
  mode: "text/x-csrc",
  vimMode: true,
  matchBrackets: true,
  showCursorWhenSelecting: true,
  lineWrapping: true,
});

editor.setSize(null, 400);
editor.setOption("theme","blackboard");

CodeMirror.Vim.defineOption("nu", true, "boolean", function(value) {
  editor.setOption("lineNumbers", value);
});

