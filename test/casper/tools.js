// casperjs test --pre

casper.on('remote.message', function(msg) {
  casper.echo(">>>> " + msg);
});

casper.getFocus = function() {
  casper.page.evaluate(function() {
    editor.focus();
  });
};

casper.getHelps = function() {
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

casper.maybeSpecialKey = function(key) {
  var special = casper.page.event.key;
  switch (key) {
    case 'ENTER': return special.Enter; break;
    case 'ESC': return special.Escape; break;
    default: return key
  }
};

casper.runTestSuite = function(title, runner, suite) {

  casper.test.begin(title, suite.length, function (test) {
    casper.start("../../index.html", function() {
      this.viewport(1366, 768);
      casper.getFocus();
    });

    casper.each(suite, function(self, testCase) {
      self.wait(INTERVAL_TEST_CASE, function() {
        runner(test, testCase);
      });
    });

    casper.run(function() {
      test.done();
    });
  });
};


