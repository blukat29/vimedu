
CodeMirror.commands.save = function() {
  alert("saved.");
};

var editor = CodeMirror.fromTextArea(document.getElementById("vim"), {
  lineNumbers: true,
  mode: "text/x-csrc",
  vimMode: true,
  matchBrackets: true,
  showCursorWhenSelecting: true,
});

