// casperjs test

function getHelps() {
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
}; // getHelps()

function getFocus() {
  casper.page.evaluate(function() {
    editor.focus();
  });
};

casper.test.begin("Interaction test.", 1, function suite(test) {
  casper.start("../../index.html", function() {
    test.assertExists("#helps-display", "#helps-display exists.");
  });

  casper.then(function() {

    casper.wait(1000, function() {
    getFocus();
    casper.page.sendEvent('keypress', 'd');
    casper.page.sendEvent('keypress', '3');
    casper.page.sendEvent('keypress', '0');
    casper.page.sendEvent('keypress', 'w');

    casper.wait(500, function() {
    var result = casper.evaluate(getHelps);
    console.log(result);

    });
    });
  });

  casper.run(function() {
    test.done();
  });
});

