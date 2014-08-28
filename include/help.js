
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

    var kbd = $("<div><kbd>"+keys+"</kbd></div>");
    var txt = $("<div>"+help+"</div>");
    display.append(kbd).append(txt);
  };

  var clear = function() {
    display.html("");
  };

  return {
    append: append,
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
  var fsm = VimFSM(context);

  var helpViewer = HelpViewer(context);
  var keysViewer = KeysViewer(context);

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

  var showHelp = function(cmd) {
    switch (fsm.current) {
      case '_simpleMotion':
        helpViewer.clear();
        helpViewer.append(cmd.keys, "Move "+cmd.help);
        break;
      case '_operatorLinewise':
        helpViewer.append(cmd.keys, "This line");
        break;
      case '_operator':
      case '_action':
      case '_search':
      case '_ex':
        helpViewer.clear();
        helpViewer.append(cmd.keys, cmd.help);
        break;
      case '_operatorsMotion':
      case '_modifier':
      case '_textobj':
        helpViewer.append(cmd.keys, cmd.help);
        break;
      case '_none':
        helpViewer.clear();
        break;
      default:
        throw "no such state.";
    }
  };

  var showRepeat = function() {
    helpViewer.append(numBuf, "Repeat "+numBuf.join('')+" times.");
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
      fsm[match.type](match);
      showKeys();
    }
    else {
      if (isNonzero(key) && fsm.can('nonzero') ||
          key == '0' && fsm.can('zero')) {

        // keyBuf is for command sequences, no repeat counts.
        numBuf.push(keyBuf.pop());
        fsm.nonzero();
        showRepeat();
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

