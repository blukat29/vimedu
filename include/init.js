
// Save command override.
CodeMirror.commands.save = function() {
  alert("saved.");
};

// Initialize vim.
var editor = CodeMirror.fromTextArea(document.getElementById("vim"), {
  lineNumbers: true,
  vimMode: true,
  matchBrackets: true,
  showCursorWhenSelecting: true,
  lineWrapping: true,
  theme: "lesser-dark",
});

editor.setSize(null, 400);
editor.setOption("maxHighlightLength", -100);

CodeMirror.Vim.defineOption("nu", true, "boolean", function(value) {
  editor.setOption("lineNumbers", value);
});

CodeMirror.Vim.defineOption("syntax", false, "boolean", function(value) {
  if (value) {
    editor.setOption("maxHighlightLength", 10000);
  }
  else {
    editor.setOption("maxHighlightLength", -100);
  }
});

