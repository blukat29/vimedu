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

  var focused = true;

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
      if (!focused) {
        $("#vim-overlay").css("opacity","0.0");
      }
    });

    CodeMirror.on(editor, 'vim-quit', function() {
      focused = false;
      $("#vim-overlay").css("opacity","0.7");
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

  var init = function() {
    initVimOverlay();
  };

  return {
    init: init,
    setVerifier: setVerifier,
  };
}

var tutorial = new Tutorial(questListEN);

