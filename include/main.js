
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
var curr_mode;
function mode_change(next_mode) {
  var curr = $("#mode-"+curr_mode);
  var next = $("#mode-"+next_mode);
  curr.removeClass("mode-active");
  next.addClass("mode-active");
  curr_mode = next_mode;
}
CodeMirror.on(editor, 'vim-mode-change', function(e) {
  mode_change(e.mode);
  commandHelper.onMode(e.mode);
});

// Initialize the site.
$(document).ready(function(){
  current_mode = 'normal';
  mode_change('normal');
  commandHelper.init();
  tutorial.init();
});

