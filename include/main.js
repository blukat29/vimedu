
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

// Initialize the site.
$(document).ready(function(){
  commandHelper.init();
  commandHelper.onKey('<Esc>');
  tutorial.init();
  var h = $(window).height() - 50 - 90;
  editor.setSize(null, h);
});

$(window).resize(function() {
  var h = $(window).height() - 50 - 90;
  editor.setSize(null, h);
});
