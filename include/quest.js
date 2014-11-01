var basicLevels = 6;

function Tutorial() {

  var goTutorial = function(filename) {
    $.ajax({
      url: "levels/" + filename,
    }).done(function(data) {
      $("#tutorial").html(data);
    }).fail(function() {
      throw "file levels/" + filename + " not found";
    });
  };

  var verifier = function() { return true; };
  var nextFile = "basic0.html";

  var setVerifier = function(func, file) {
    verifier = func;
    nextFile = file;
  };

  var clickHandlerFactory = function(i) {
    return function() {
      location.hash = "#"+i;
    }
  }

  var init = function() {
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

    for (var i=0; i<basicLevels; i++) {
      var btn = $("<button type=\"button\" class=\"btn\"></button");
      btn.addClass("btn-default");
      btn.attr("id","btn"+i);
      btn.text(i);
      btn.click(clickHandlerFactory(i));
      $("#quest-btns").append(btn);
    }
  }

  var hashchange = function(h) {
    if (!h.match(/#\d+$/))
      return;
    var n = parseInt(h.substr(1));
    for (var i=0; i<n; i++) {
      $("#btn"+i).removeClass("btn-default")
                 .removeClass("btn-primary")
                 .addClass("btn-success");
    }
    $("#btn"+n).removeClass("btn-default")
               .removeClass("btn-success")
               .addClass("btn-primary");
    for (var i=n+1; i<basicLevels; i++) {
      $("#btn"+i).removeClass("btn-success")
                 .removeClass("btn-primary")
                 .addClass("btn-default");
    }
    goTutorial("level"+n+".html");
  }

  return {
    init: init,
    setVerifier: setVerifier,
    hashchange: hashchange,
  };
}

var tutorial = new Tutorial();

