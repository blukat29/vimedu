// casperjs test

INTERVAL_TEST_CASE = 500;
  INTERVAL_KEY_EVENT = 50;
  INTERVAL_RESULT = 100;

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
}; // getFocus()

function runSingleTest(test, testCase) {

  var given = testCase.given;
  var expected = testCase.expected;
  var comment = testCase.comment || "no comment.";

  // Send key inputs.
  casper.each(given, function(self, key) {
    self.wait(INTERVAL_KEY_EVENT, function() {
      casper.page.sendEvent('keypress', key);
    });
  });

  // After a while, get the displayed helps.
  casper.wait(INTERVAL_RESULT, function() {
    var result = casper.evaluate(getHelps);
    var message = given.toString() + " : " + comment;

    test.assertEquals(result, expected, message);
  });
}; // singleFSMTest()

function runTestSuite(title, suite) {

  casper.test.begin(title, suite.length, function (test) {
    casper.start("../../index.html", function() {
      getFocus();
    });

    casper.each(suite, function(self, testCase) {
      self.wait(INTERVAL_TEST_CASE, function() {
        runSingleTest(test, testCase);
      });
    });

    casper.run(function() {
      test.done();
    });
  });
};

runTestSuite("operators", [
  { given: ['d','3','0','w'], expected: ['d','30','w'], comment: "operator with counted motion" },
  { given: ['d','3','0','w'], expected: ['d','30','w'], comment: "operator with counted motion" },
]);

runTestSuite("operators", [
  { given: ['d','3','0','w'], expected: ['d','30','w'], comment: "operator with counted motion" },
  { given: ['d','3','0','w'], expected: ['d','30','w'], comment: "operator with counted motion" },
]);

