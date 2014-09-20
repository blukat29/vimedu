function Tutorial() {

  var getHelps = function() {
    var children = $("#helps-display").children();

    var result = [];
    for (var i = 0; i < children.length; i ++) {
      var child = children[i];
      var kbds = $("div:first", child).children();

      var keys = "";
      for (var j = 0; j < kbds.length; j ++) {
        var kbd = kbds[j];
        keys += kbd.innerHTML;
      }
      result.push(keys);
    }
    return result;
  };

  var compareKeys = function (a, b) {
    if (a.length !== b.length)
      return false;
    for (var i=0; i<a.length; i++) {
      if (a[i] !== b[i] && a[i] !== 'char')
        return false;
    }
    return true;
  };

  var listeners = [];

  var onKey = function() {
    var helps = getHelps();
    for (var i = 0; i < listeners.length; i ++) {
      var listener = listeners[i];
      if (compareKeys(listener.keys, helps)) {
        goTutorial(listener.file);
        break;
      }
    }
  };

  var addListener = function(keys, file) {
    listeners.push({keys: keys, file: file});
  };

  var goTutorial = function(filename) {
    $.ajax({
      url: "levels/" + filename,
    }).done(function(data) {
      $("#tutorial").html(data);
    });
  };

  var active = true;

  var initVimOverlay = function() {
    var cm = $(".CodeMirror");
    var ov = $("#vim-overlay");
    ov.css("z-index",1000);
    ov.css("position","absolute");
    ov.offset(cm.offset());
    ov.outerHeight(cm.outerHeight());
    ov.outerWidth(cm.outerWidth());

    $("#vim-overlay").click(function() {
      if (active) {
        editor.focus();
      }
    });

    // Dummy textarea to move the focus into.
    // Prevents keys are typed into vim when shell is up.
    var tx = $("<textarea></textarea>");
    tx.css("position","absolute");
    tx.offset({top:-1000});
    ov.append(tx);

    CodeMirror.on(editor, 'vim-quit', function() {
      active = false;
      $("#vim-overlay").css("opacity","1.0");
      $("#quest-shell").show();
      tx.focus();
      $("#quest-shell").click();
    });
  };

  var returnToEditor = function() {
    active = true;
    $("#vim-overlay").css("opacity","0.0");
    $("#quest-shell").hide();
    editor.focus();
    goTutorial("level6.html");
  };

  var interp = function(command) {
    switch (command) {
      case 'vi':
        returnToEditor();
        break;
      default:
        throw "unknown command: "+command;
    }
  };

  var initShell = function() {
    jQuery(function($, undefined) {
      $("#quest-shell").terminal(function(command, term) {
        if (command !== '') {
          try {
            var result = interp(command);
            if (result !== undefined) {
              term.echo(new String(result));
            }
          } catch(e) {
            term.error(new String(e));
          }
        }
      }, {
        greetings: "Quest Shell",
        height: $("#vim-overlay").outerHeight(),
        prompt: 'shell> '});
    });
  };

  var init = function() {
    initVimOverlay();
    initShell();
    $("#quest-shell").hide();
  };

  return {
    init: init,
    onKey: onKey,
    addListener: addListener,
  };
}

var tutorial = new Tutorial();

