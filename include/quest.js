var questListEN = [
  { title:"Ch 1. Say hi to vim!", link:"title-1.html", levels: [
    { text:"Level 1-1. Exit vim. :q", link:"level-1-1.html" },
    { text:"Level 1-2. Save file. :w", link:"level-1-2.html" },
  ]},
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

  var getClickHandler = function(link) {
    return function() {
      goTutorial(link);
    }
  }

  var initQuestList = function() {

    for (var i = 0; i < questList.length; i ++) {
      var chapter = questList[i];

      var a = $("<a></a>")
        .addClass("quest-chapter")
        .click(getClickHandler(chapter.link))
        .html(chapter.title);
      var ul = $("<ul></ul>");

      var levels = chapter.levels;
      for (var j = 0; j < levels.length; j ++) {
        var level = levels[j];
        var b = $("<a></a>")
          .addClass("quest-level")
          .click(getClickHandler(level.link))
          .html(level.text);
        var li = $("<li></li>");
        li.append(b);
        ul.append(li);
      }

      $("#quest-list").append(a);
      $("#quest-list").append(ul);
    }
  }

  var init = function() {
    initVimOverlay();
    initQuestList();
  };

  return {
    init: init,
    setVerifier: setVerifier,
  };
}

var tutorial = new Tutorial(questListEN);

