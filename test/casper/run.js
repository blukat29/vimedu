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
}; // getFocus()

function runSingleTest(test, testCase) {

  var given = testCase[0];
  var expected = testCase[1];
  var comment = (testCase.length >= 2) ? testCase[2] : "no comment.";

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

var INTERVAL_TEST_CASE = 150;
var   INTERVAL_KEY_EVENT = 10;
var   INTERVAL_RESULT = 30;

casper.test.begin("Confirm test parameters", 1, function(test) {
  var LONGEST_KEYS = 10;
  var longest_test_case = INTERVAL_KEY_EVENT * LONGEST_KEYS + INTERVAL_RESULT;
  test.assertTruthy(INTERVAL_TEST_CASE > longest_test_case, "interval values are ok");
  test.done();
});

runTestSuite("motion keys", [
  [ ['w'],         ['w'],      "simple motion" ],
  [ ['g','g'],     ['gg'],     "two key motion" ],
  [ ['f','w'],     ['fchar'],  "two key motion with wildcard" ],
  [ ['0','w'],     ['w'],      "zero key should not treated as count." ],
  [ ['2','b'],     ['2','b'],  "motion with count" ],
  [ ['1','0','w'], ['10','w'], "zero key as a count" ],
]);

runTestSuite("operators", [
  [ ['d','d'],         ['d','d'],         "simple double operator" ],
  [ ['d','2','d'],     ['d','2','d'],     "double operator with repetition" ],
  [ ['2','d','d'],     ['2','d','d'],     "double operator with repetition" ],
  [ ['2','d','3','d'], ['2','d','3','d'], "double operator with repetition" ],
  [ ['d','w'],         ['d','w'],         "simple operator motion" ],
  [ ['1','2','d','2','0','3','w'], ['12','d','203','w'], "repeatition frenzy!" ],
  [ ['d','c'],         [], "different operators in a row is an error." ],
  [ ['d','2','c'],     [], "different operators in a row is an error." ],
  [ ['2','d','c'],     [], "different operators in a row is an error." ],
  [ ['4','d','2','c'], [], "different operators in a row is an error." ],
  [ ['x','w'],         ['w'], "x key is not an operator in normal mode" ],
]);

runTestSuite("visual mode", [
  [ ['v','v'],                 ['v'],               "abort visual mode" ],
  [ ['v','d'],                 ['v','d'],           "simple visual mode operation" ],
  [ ['v','w','w','w','d'],     ['v','w','d'],       "show only last motion" ],
  [ ['v','3','0','2','w','d'], ['v','302','w','d'], "show only last motion" ],
  [ ['v','i',')','d'],         ['v','i',')','d'],   "visual mode text object" ],
  [ ['v','w','x'],             ['v','w','x'],       "x key is an operator in visual mode" ],
]);

var ENTER = casper.page.event.key.Enter;
runTestSuite("ex mode", [
  [ [':set nu',ENTER,'d','d'], ['d','d'],           "enter key to come back to normal mode" ],
]);

