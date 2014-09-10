
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
  tutorial.init();
});

