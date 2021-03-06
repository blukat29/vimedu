// casperjs test

function fsmTester(test, testCase) {

  var given = testCase[0];
  var expected = testCase[1];
  var comment = (testCase.length >= 2) ? testCase[2] : "no comment.";

  // Send key inputs.
  casper.each(given, function(self, key) {
    self.wait(INTERVAL_KEY_EVENT, function() {
      key = casper.maybeSpecialKey(key);
      casper.page.sendEvent('keypress', key);
    });
  });

  // After a while, get the displayed helps.
  casper.wait(INTERVAL_RESULT, function() {
    var result = casper.evaluate(casper.getHelps);
    var message = given.toString() + " : " + comment;

    test.assertEquals(result, expected, message);
  });
}; // singleFSMTest()

casper.runTestSuite("motion keys", fsmTester, [
  [ ['w'],         ['w'],      "simple motion" ],
  [ ['g','g'],     ['gg'],     "two key motion" ],
  [ ['f','w'],     ['fchar'],  "two key motion with wildcard" ],
  [ ['0','w'],     ['w'],      "zero key should not treated as count." ],
  [ ['2','b'],     ['2','b'],  "motion with count" ],
  [ ['1','0','w'], ['10','w'], "zero key as a count" ],
]);

casper.runTestSuite("operators", fsmTester, [
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

casper.runTestSuite("visual mode", fsmTester, [
  [ ['v','v'],                 ['v'],               "abort visual mode" ],
  [ ['v','d'],                 ['v','d'],           "simple visual mode operation" ],
  [ ['v','w','w','w','d'],     ['v','w','d'],       "show only last motion" ],
  [ ['v','3','0','2','w','d'], ['v','302','w','d'], "show only last motion" ],
  [ ['v','i',')','d'],         ['v','i',')','d'],   "visual mode text object" ],
  [ ['v','w','x'],             ['v','w','x'],       "x key is an operator in visual mode" ],
]);

casper.runTestSuite("multi-key commands", fsmTester, [
  [ ['g'],        ['g'],       "display partial key on the fly" ],
  [ ['g'],        ['gg'],      "complete command replaces the patial key" ],
  [ ['d','g'],    ['d','g'],   "display partial key after an operator" ],
  [ ['g'],        ['d','gg'],  "complete command replaces the partial key" ],
]);

casper.runTestSuite("ex mode", fsmTester, [
  [ [':set nu','ENTER','d','d'], ['d','d'],           "enter key to come back to normal mode" ],
  [ [':q','ENTER'],              [':q'],              "Show ex command result." ],
  [ [':syntax off','ENTER'],     [':syntax off'],     "Syntax command" ],
]);

