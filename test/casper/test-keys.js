// casperjs test

function getVisibility(list) {
  var result = {};
  for (var i = 0; i < list.length; i ++) {
    var item = list[i];
    result[item] = $("."+item+":not(.keys-header)").is(":visible");
  }
  return result;
}

function keysTester(test, testCase) {
  var given = testCase[0];
  var comment = testCase[1];
  var shown = testCase[2];
  var hidden = testCase[3];

  var checklist = [];
  shown.forEach(function(e) { checklist.push(e); });
  hidden.forEach(function(e) { checklist.push(e); });
  var expected = {};
  for (var i=0; i < shown.length; i ++) {
    expected[shown[i]] = true;
  }
  for (var i=0; i < hidden.length; i ++) {
    expected[hidden[i]] = false;
  }

  // Send key inputs.
  casper.each(given, function(self, key) {
    self.wait(INTERVAL_KEY_EVENT, function() {
      key = casper.maybeSpecialKey(key);
      casper.page.sendEvent('keypress', key);
    });
  });

  casper.wait(INTERVAL_RESULT, function() {
    var result = casper.evaluate(getVisibility, checklist);
    var message = given.toString() + " : " + comment;
    test.assertEquals(result, expected, message);
  });
};

casper.runTestSuite("visibility", keysTester, [
  [ ['w'],   "_none state",
    ['motion','operator','action','search','ex','done','visual'],
    ['modifier','textobj'] ],

  [ ['g'],   "partial key",
    ['partial-g'],
    ['single-key:not(.done)'], ],

  [ ['g'],   "... and get back to _none state",
    ['motion','operator','action','search','ex','done','visual'],
    ['modifier','textobj'] ],
]);

