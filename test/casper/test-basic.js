casper.test.begin("Basic components test.", 1, function (test) {
  casper.start("../../index.html", function() {
    test.assertExists("#helps-display", "#helps-display exists");
  });

  casper.run(function() {
    test.done();
  });
});

casper.test.begin("Confirm test parameters", 1, function(test) {
  var LONGEST_KEYS = 10;
  var longest_test_case = INTERVAL_KEY_EVENT * LONGEST_KEYS + INTERVAL_RESULT;
  test.assertTruthy(INTERVAL_TEST_CASE > longest_test_case, "interval values are ok");
  test.done();
});

