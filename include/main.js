
/* global CodeMirror */
/* global commandHelper */
/* global tutorial */

// Key input events.
CodeMirror.on(editor, 'vim-keypress', function(e) {
  commandHelper.onKey(e);
});
CodeMirror.on(editor, 'vim-command-done', function() {
  commandHelper.done();
});
CodeMirror.on(editor, 'vim-ex-done', function(e) {
  commandHelper.onKey(":"+e);
});
CodeMirror.Vim.getRegisterController().unnamedRegister.setListener(editor);
CodeMirror.on(editor, 'vim-set-register', function(e) {
  $("#register-display").val(e).trigger('autosize.resize');
});

// Mode display.
function mode_change(mode) {
  var target = $("#mode-"+mode);
  var t = target.offset().top - target.parent().offset().top;
  var l = target.offset().left - target.parent().offset().left;

  $("#mode-selector").stop(); // Abort any previous animations.
  $("#mode-selector").animate({top:t+10, left:l-15}, 100);
}
CodeMirror.on(editor, 'vim-mode-change', function(e) {
  mode_change(e.mode);
  commandHelper.onMode(e.mode);
});

// Initialize the site.
$(document).ready(function(){
  mode_change('normal');
  commandHelper.init();
  tutorial.init();
});

