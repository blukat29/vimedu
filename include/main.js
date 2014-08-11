
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

// Key buffer display.
var keybuf = ''
CodeMirror.on(editor, 'vim-keypress', function(e) {
  keybuf = keybuf + e;
  $("#command-display").html(keybuf);
});
CodeMirror.on(editor, 'vim-command-done', function(e) {
  keybuf = '';
  $("#command-display").html(keybuf);
});

// Mode display.
function mode_change(mode) {
  $("#mode-display").html(mode);

  var target={};
  target['normal'] = $("#mode-normal").offset();
  target['insert'] = $("#mode-insert").offset();
  target['visual'] = $("#mode-visual").offset();

  var offset_now = $("#mode-selector").offset();
  var dt = target[mode].top - offset_now.top;

  $("#mode-selector").animate({top:"+="+dt}, 100);
}
CodeMirror.on(editor, 'vim-mode-change', function(e) {
  mode_change(e['mode']);
});

// Initialize the site.
$(document).ready(function(){
  mode_change('normal');
});

