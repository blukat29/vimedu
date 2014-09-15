casper.test.begin("Basic components test.", 1, function (test) {
  casper.start("../../index.html", function() {
    test.assertExists("#helps-display", "#helps-display exists");
  });

  casper.run(function() {
    test.done();
  });
});
