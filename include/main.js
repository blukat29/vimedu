
CodeMirror.commands.save = function() {
  alert("saved.");
};

var editor = CodeMirror.fromTextArea(document.getElementById("vim"), {
  lineNumbers: true,
  mode: "text/x-csrc",
  vimMode: true,
  matchBrackets: true,
  showCursorWhenSelecting: true,
  lineWrapping: true,
});

var keybuf = ''
CodeMirror.on(editor, 'vim-keypress', function(e) {
  keybuf = keybuf + e;
  $("#command-display").html(keybuf);
});
CodeMirror.on(editor, 'vim-command-done', function(e) {
  keybuf = '';
  $("#command-display").html(keybuf);
});

CodeMirror.on(editor, 'vim-mode-change', function(e) {
  $("#mode-display").html(e['mode']);
});

