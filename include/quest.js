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
  }

  return {
    init: init,
    setVerifier: setVerifier,
  };
}

var tutorial = new Tutorial();

