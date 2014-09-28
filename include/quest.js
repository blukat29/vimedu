var questListEN = [
  { short:"Level 0", file:"level0.html", text:"Insert text, Save file, Exit vim." },
  { short:"Level 1", file:"level1.html", text:"Blah blah blah" },
  { short:"Level 2", file:"level2.html", text:"Blah blah blah" },
  { short:"Level 6", file:"level6.html", text:"Operators on a line." },
];

function Tutorial(questList_) {

  var questList = questList_;

  var verifier = function() { return true; };
  var nextFile = "level0.html";

  var setVerifier = function(func, file) {
    verifier = func;
    nextFile = file;
  };

  var goTutorial = function(filename) {
    $.ajax({
      url: "levels/" + filename,
    }).done(function(data) {
      $("#tutorial").html(data);
    }).fail(function() {
      throw "file levels/" + filename + " not found";
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

    CodeMirror.on(editor, 'vim-quit', function() {
      active = false;
      $("#quest-explorer").show();
      $("#vim-overlay").css("opacity","1.0");
      $("#btn-0").focus();
    });

    CodeMirror.commands.save = function() {
      var result = verifier();
      if (result) {
        alert("Good job! going to next level.");
        goTutorial(nextFile);
      }
      else {
        alert("Awww.. try again.");
      }
    };
  };

  var keyHandler = function(i) {
    var maybeMove = function(i) {
      if (i >= 0 && i < questList.length) {
        $("#btn-"+i.toString()).focus();
      }
    };
    return function(e) {
      switch(e.which) {
        case 75: // k
        case 38: // up
          e.preventDefault(); // Prevent browser's scrolling
          maybeMove(i-1);
          break;
        case 74: // j
        case 40: // down
          e.preventDefault();
          maybeMove(i+1);
          break;
      }
    };
  };

  var returnToEditor = function(file) {
    return function() {
      active = true;
      goTutorial(file);
      $("#quest-explorer").hide();
      $("#vim-overlay").css("opacity","0.0");
      $("#vim-overlay").click();
    }
  };

  var initButtons = function() {

    var group = $("#quest-button-group");

    for (var i = 0; i < questList.length; i ++) {
      var level = questList[i];

      var button = $("<button></button>");
      button.addClass("btn").addClass("btn-default");

      button.keydown(keyHandler(i));
      button.click(returnToEditor(level.file));

      var icon = $('<span class="glyphicon glyphicon-play"></span>');
      var text = $('<span></span>').html(level.text);
      button.append(icon).append(text);

      button.attr("id", "btn-"+i.toString());
      group.append(button);
    }
    $("#quest-explorer").append(group);
  };

  var init = function() {
    initVimOverlay();
    initButtons();
    $("#quest-explorer").hide();
  };

  return {
    init: init,
    setVerifier: setVerifier,
  };
}

var tutorial = new Tutorial(questListEN);

