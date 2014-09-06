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

CodeMirror.on(editor, 'vim-quit', function() {
  alert("quit");
});


