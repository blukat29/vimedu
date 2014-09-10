
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

  var goTutorial = function(filename) {
    $.ajax({
      url: "levels/" + filename,
    }).done(function(data) {
      $("#tutorial").html(data);
    });
  };

  var initVimOverlay = function() {
    var cm = $(".CodeMirror");
    var ov = $("#vim-overlay");
    ov.css("z-index",1000);
    ov.css("position","absolute");
    ov.offset(cm.offset());
    ov.outerHeight(cm.outerHeight());
    ov.outerWidth(cm.outerWidth());

    $("#vim-overlay").click(function() {
      editor.focus();
    });

    CodeMirror.on(editor, 'vim-quit', function() {
      $("#vim-overlay").css("opacity","1.0");
      $("#quest-explorer").show();
      $("#level-0").focus();
    });
  }; // initVimOverlay

  var initLevelButtons = function(nLevels) {
    var i;
    var level = [];

    for (i = 0; i < nLevels; i ++) {
      level[i] = $("<button id='level-"+i+"' class='btn btn-default'></button>");
      level[i].html("Level " + i);
      var div = $("<div class='col-sm-4 quest-block'></div>");
      div.append(level[i]);
      div.css("padding","10px");
      $("#quest-explorer").append(div);
    }

    var handler = function(i) {
      var move_if_exists = function(i) {
        if (i >= 0 && i < nLevels) {
          level[i].focus();
        }
      };
      return function(e){
        switch(e.which) {
          case 72: // h
          case 37: // left
            move_if_exists(i-1);
            break;
          case 75: // k
          case 38: // up
            e.preventDefault(); // prevent browser's scrolling behavior.
            move_if_exists(i-3);
            break;
          case 76: // l
          case 39: // right
            move_if_exists(i+1);
            break;
          case 74: // j
          case 40: // down
            e.preventDefault(); // prevent browser's scrolling behavior.
            move_if_exists(i+3);
            break;
          case 9:  // tab
            e.preventDefault();
            move_if_exists(i+1);
            break;
        }
      };
    }; // handler

    var returnToEditor = function() {
      $("#vim-overlay").css("opacity","0.0");
      $("#quest-explorer").hide();
      editor.focus();
      goTutorial("level0.html");
    }; // returnToEditor

    for (i=0; i < nLevels; i ++) {
      level[i].keydown(handler(i));
      level[i].click(returnToEditor);
    }
  }; // initLevelButtons

  var init = function() {
    initVimOverlay();
    initLevelButtons(6);
  };

  return {
    init: init,
  };
}

var tutorial = new Tutorial();

