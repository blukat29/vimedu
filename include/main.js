
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
  var match = commandHelper.matchCommand(e);
});
CodeMirror.on(editor, 'vim-command-done', function(e) {
  keybuf = '';
  $("#command-display").html(keybuf);
  commandHelper.done();
});

// Mode display.
function mode_change(mode) {
  $("#mode-display").html(mode);

  var target = $("#mode-"+mode);
  var t = target.offset().top;
  var l = target.offset().left - target.parent().offset().left;
  var h = target.outerHeight();
  var w = target.outerWidth();

  $("#mode-selector").stop(); // Abort any previous animations.
  $("#mode-selector").animate({top:t, left:l, height:h, width:w}, 100);
}
CodeMirror.on(editor, 'vim-mode-change', function(e) {
  mode_change(e['mode']);
});

// Initialize the site.
$(document).ready(function(){
  mode_change('normal');
});

