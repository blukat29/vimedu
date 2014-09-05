
/* global CodeMirror */
/* global commandHelper */

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

$("#vim-overlay").click(function() {
  editor.focus();
});

(function() {
  var cm = $(".CodeMirror");
  var ov = $("#vim-overlay");
  ov.css("z-index",10);
  ov.css("position","absolute");
  ov.offset(cm.offset());
  ov.outerHeight(cm.outerHeight());
  ov.outerWidth(cm.outerWidth());
})();

// Key input events.
CodeMirror.on(editor, 'vim-keypress', function(e) {
  commandHelper.onKey(e);
});
CodeMirror.on(editor, 'vim-command-done', function() {
  commandHelper.done();
});
CodeMirror.Vim.getRegisterController().unnamedRegister.setListener(editor);
CodeMirror.on(editor, 'vim-set-register', function(e) {
  $("#register-display").val(e).trigger('autosize.resize');
});

// Mode display.
function mode_change(mode) {
  var target = $("#mode-"+mode);
  var t = target.offset().top;
  var l = target.offset().left - target.parent().offset().left;
  var h = target.outerHeight();
  var w = target.outerWidth();

  $("#mode-selector").stop(); // Abort any previous animations.
  $("#mode-selector").animate({top:t, left:l, height:h, width:w}, 100);
}
CodeMirror.on(editor, 'vim-mode-change', function(e) {
  mode_change(e.mode);
});

// Initialize the site.
$(document).ready(function(){
  mode_change('normal');
  commandHelper.init();
});

