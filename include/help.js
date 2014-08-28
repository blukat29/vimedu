
var commandListEN = [
  // Motion commands. Can be used alone, or used with operator.
  { type:'motion', commands:[
    { keys:['h'],       help:'to left' },
    { keys:['j'],       help:'to down' },
    { keys:['k'],       help:'to up' },
    { keys:['l'],       help:'to right' },
    { keys:['<Left>'],  help:'to left' },
    { keys:['<Down>'],  help:'to down' },
    { keys:['<Up>'],    help:'to up' },
    { keys:['<Right>'], help:'to right' },

    { keys:['w'],       help:'a word' },
    { keys:['b'],       help:'a word backward' },

    { keys:['0'],       help:'to start of line' },
    { keys:['$'],       help:'to end of line' },

    { keys:['g','g'],   help:'to start of file' },
  ]},
  // Operator commands. Always used with either (i) motion,
  // (ii) a modifier + text-object (iii) itself, meaning linewise operation.
  { type:'operator', commands:[
    { keys:['d'],     help:'Delete' },
    { keys:['y'],     help:'Yank (copy)' },
    { keys:['c'],     help:'Change' },
    { keys:['p'],     help:'Paste' },
    { keys:['>'],     help:'Indent' },
    { keys:['<'],     help:'Unindent' },
  ]},
  // Action commands. Always used alone. Each one is complete as itself.
  { type:'action', commands:[
    { keys:['i'],     help:'Switch to insert mode' },
    { keys:['v'],     help:'Switch to visual mode' },
    { keys:['x'],     help:'Delete a character' },
    { keys:['u'],     help:'Undo' },
    { keys:['<C-r>'], help:'Redo' },
  ]},
  // Modifiers. Used before text object.
  { type:'modifier', commands:[
    { keys:['a'],     help:'Around' },
    { keys:['i'],     help:'Inside' },
  ]},
  // Text objects. Used after a modifier.
  { type:'textobj', commands:[
    { keys:['w'],     help:'Word' },
    { keys:['"'],     help:'Dobule quote' },
    { keys:['\''],    help:'Single quote' },
    { keys:['('],     help:'Parenthesis' },
    { keys:[')'],     help:'Parenthesis' },
    { keys:['{'],     help:'Braces' },
    { keys:['}'],     help:'Braces' },
    { keys:['['],     help:'Brackets' },
    { keys:[']'],     help:'Brackets' },
  ]},
  // Search commands.
  { type:'search', commands:[
    { keys:['/'],     help:'Search forward' },
  ]},
  // Ex commands.
  { type:'ex', commands:[
    { keys:[':'],     help:'Use ex command' },
  ]},
  // Esc is treated specially.
  { type:'done', commands:[
    { keys:['<Esc>'], help:'Cancel command' },
  ]},
];

// Interface to manipulate current command help at the bottom.
function HelpViewer(context) {

  var display = $("#helps-display", context);

  var append = function(keys, help) {
    keys = keys.join('');
    keys = keys.replace("<","&lt;");
    keys = keys.replace(">","&gt;");

    var div = $("<div></div>")
    var kbd = $("<div><kbd>"+keys+"</kbd></div>");
    var txt = $("<div>"+help+"</div>");

    div.append(kbd).append(txt);
    display.append(div);
  };

  var updateLast = function(keys, help) {
    var children = display.children();
    var last = $(children[children.length - 1])

    keys = keys.join('');
    keys = keys.replace("<","&lt;");
    keys = keys.replace(">","&gt;");

    var div = $("<div></div>")
    var kbd = $("<div><kbd>"+keys+"</kbd></div>");
    var txt = $("<div>"+help+"</div>");

    div.append(kbd).append(txt);
    last.html(div);
  };

  var clear = function() {
    display.html("");
  };

  return {
    append: append,
    updateLast: updateLast,
    clear: clear,
  };
}

// Interface to suggested keys help at the right.
function KeysViewer(context) {
  var display = $("#keys-display");

  var appendType = function(bundle) {
    var div = $("<div></div>").addClass(bundle.type);
    var title = $("<h4>"+bundle.type+"</h4>");
    div.append(title);
    display.append(div);
    return div;
  };

  var appendCommand = function(container, cmd) {
    var keys = cmd.keys;
    keys = keys.join('').replace('<','&lt;').replace('>','&gt;');

    var div = $("<div></div>");
    var kbd = $("<kbd>"+keys+"</kbd>");
    var txt = $("<span>  "+cmd.help+"</span>");
    div.append(kbd).append(txt);
    container.append(div);
  };

  var init = function(commandList) {

    for (var i=0; i<commandList.length; i++) {
      var bundle = commandList[i];
      var container = appendType(bundle);

      for (var j=0; j<bundle.commands.length; j++) {
        var cmd = bundle.commands[j];
        appendCommand(container, cmd);
      }
    }
  };

  var update = function(filter) {
    for (var type in filter) {
      if (filter[type])
        $("."+type, display).show();
      else
        $("."+type, display).hide();
    }
  };

  return {
    init: init,
    update: update,
  };
}

// Simple model for vim command grammar.
function VimFSM(context) {
  var fsm = StateMachine.create({
    initial:'_none',
    events: [
      { name:'motion',   from:'_none',       to:'_simpleMotion'    },
      { name:'motion',   from:'_noneRepeat', to:'_simpleMotion'    },
      { name:'motion',   from:'_operator',   to:'_operatorsMotion' },

      { name:'operator', from:'_none',       to:'_operator'        },
      { name:'operator', from:'_noneRepeat', to:'_operator'        },
      { name:'operator', from:'_operator',   to:'_operatorLinewise'},

      { name:'action',   from:'_none',       to:'_action'          },
      { name:'action',   from:'_noneRepeat', to:'_action'          },

      { name:'modifier', from:'_operator',   to:'_modifier'        },
      { name:'textobj',  from:'_modifier',   to:'_textobj'         },

      { name:'search',   from:'_none',       to:'_search'          },
      { name:'ex',       from:'_none',       to:'_ex'              },

      { name:'done',     from:'*',           to:'_none'            },

      { name:'nonzero',  from:'_none',       to:'_noneRepeat'      },
      { name:'nonzero',  from:'_noneRepeat', to:'_noneRepeat'      },
      { name:'zero',     from:'_noneRepeat', to:'_noneRepeat'      },
  ]});
  fsm.events = ['motion','operator','action','modifier','textobj','search','ex'];
  return fsm;
}

// Outermost interface to overall help functionality.
function CommandHelper (commandList_, context) {

  var commandList = commandList_;

  var helpViewer = HelpViewer(context);
  var keysViewer = KeysViewer(context);

  var fsm = VimFSM(context);

  // Returns a default event handler for FSM.
  // The argument is optional function that decorates
  // the printing format of command.help.
  var helpFormat = function(f) {
    f = (typeof f !== 'undefined')? f : function(s) { return s; };
    return function(e, from, to, cmd) {
      helpViewer.append(cmd.keys, f(cmd.help));
    };
  };

  // Leaving _none state implies we start a new command.
  fsm.onleave_none = function() {
    helpViewer.clear();
  }

  // Describe the current command on state change.
  fsm.on_simpleMotion = helpFormat(function(s) { return "Move "+s});
  fsm.on_operatorsMotion = helpFormat();

  fsm.on_operator = helpFormat();
  fsm.on_operatorLinewise = helpFormat(function(s) { return "This line"});

  fsm.on_action = helpFormat();
  fsm.on_modifier = helpFormat();
  fsm.on_textobj = helpFormat();

  fsm.on_search = helpFormat();
  fsm.on_ex = helpFormat();

  fsm.onnonzero = function() {
    if (numBuf.length == 1)
      helpViewer.append(numBuf, "Repeat "+numBuf.join('')+" times.");
    else
      helpViewer.updateLast(numBuf, "Repeat "+numBuf.join('')+" times.");
  };
  fsm.onzero = fsm.onnonzero;

  var keyBuf = [];
  var numBuf = [];
  var matchCommand = function () {
    var match;
    for (var i=0; i<commandList.length; i++) {
      var bundle = commandList[i];

      if (fsm.can(bundle.type)) {
        for (var j=0; j<bundle.commands.length; j++) {
          var cmd = bundle.commands[j];

          if (compareKeys(cmd.keys, keyBuf)) {
            if (match)
              throw ("Duplicate command: " + keys.join());
            match = { type:bundle.type, keys:cmd.keys, help:cmd.help };
          }
        }
      }
    }
    return match;
  };

  var compareKeys = function (a, b) {
    if (a.length != b.length)
      return false;
    for (var i=0; i<a.length; i++) {
      if (a[i] != b[i])
        return false;
    }
    return true;
  };

  var showKeys = function() {
    filter = [];
    for (var i=0; i<fsm.events.length; i++) {
      var e = fsm.events[i];
      if (fsm.can(e))
        filter[e] = true;
      else
        filter[e] = false;
    }
    keysViewer.update(filter);
  };

  var onKey = function(key) {
    keyBuf.push(key);
    var match;

    // '0' key is special case since it belongs
    // in both command and repeat.
    if (key != '0' || numBuf.length == 0)
      match = matchCommand();

    if (match) {
      keyBuf = [];
      numBuf = [];
      fsm[match.type](match);
      showKeys();
    }
    else {
      if (isNonzero(key) && fsm.can('nonzero') ||
          key == '0' && fsm.can('zero')) {

        // keyBuf is for command sequences, not repeat counts.
        numBuf.push(keyBuf.pop());
        if (key == '0') fsm.zero();
        else fsm.nonzero();
        showKeys();
      }
    }
  };

  var isNonzero = function(key) {
    return (key.charCodeAt(0) >= '1'.charCodeAt(0)
         && key.charCodeAt(0) <= '9'.charCodeAt(0));
  };

  var init = function() {
    keysViewer.init(commandList);
  };

  var done = function() {
    fsm.done();
    showKeys();
  };

  return {
    onKey: onKey,
    init: init,
    done: done,
  };
}

var commandHelper = CommandHelper(commandListEN, window.body);

