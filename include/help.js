
var state_display = $("#state-display");
var helps_display = $("#helps-display");

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
    { keys:['<Esc>'], help:'Exit to normal mode' },
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
];

function appendCommand(keys, help) {
  keys = keys.join('');
  keys = keys.replace("<","&lt;");
  keys = keys.replace(">","&gt;");
  var div = $("#helps-display");
  var kbd = $("<div><kbd>"+keys+"</kbd></div>");
  var txt = $("<div>"+help+"</div>");
  div.append(kbd).append(txt);
}

function VimFSM() {
  var fsm = StateMachine.create({
    initial:'_none',
    events: [
      { name:'motion',   from:'_none',     to:'_simpleMotion'    },
      { name:'motion',   from:'_operator', to:'_operatorsMotion' },
      { name:'operator', from:'_none',     to:'_operator'        },
      { name:'operator', from:'_operator', to:'_operatorLinewise'},
      { name:'action',   from:'_none',     to:'_action'          },
      { name:'modifier', from:'_operator', to:'_modifier'        },
      { name:'textobj',  from:'_modifier', to:'_textobj'         },
      { name:'search',   from:'_none',     to:'_search'          },
      { name:'ex',       from:'_none',     to:'_ex'              },
      { name:'done',     from:'*',         to:'_none'            },
  ]});

  fsm.onenterstate = function(e, from, to) {
    state_display.html(from + " -> " + to);
  };
  fsm.onleave_none = function(e, from, to) {
    helps_display.html("");
  }

  fsm.on_simpleMotion = function(e, from, to, command) {
    appendCommand(command.keys, "Move "+command.help);
  };

  fsm.on_operator = function(e, from, to, command) {
    appendCommand(command.keys, command.help);
  };
  fsm.on_operatorLinewise = function(e, from, to, command) {
    appendCommand(command.keys, "this line");
  };
  fsm.on_operatorsMotion = function(e, from, to, command) {
    appendCommand(command.keys, command.help);
  };

  fsm.on_action = function(e, from, to, command) {
    appendCommand(command.keys, command.help);
  };

  fsm.on_modifier = function(e, from, to, command) {
    appendCommand(command.keys, command.help);
  };
  fsm.on_textobj = function(e, from, to, command) {
    appendCommand(command.keys, command.help);
  };

  fsm.on_search = function(e, from, to, command) {
    appendCommand(command.keys, command.help);
  };
  fsm.on_ex = function(e, from, to, command) {
    appendCommand(command.keys, command.help);
  };
  return fsm;
}

function CommandHelper (commandList) {
  this.commandList = commandList;
  this.fsm = VimFSM();

  this.simpleMatch = function (key) {
    matchList = [];
    var commandList = this.commandList;
    var fsm = this.fsm;

    for (var i=0; i<commandList.length; i++) {
      var bundle = commandList[i];

      if (fsm.can(bundle.type)) {
        for (var j=0; j<bundle.commands.length; j++) {
          var cmd = bundle.commands[j];

          if (cmd.keys[0] == key && cmd.keys.length == 1) {
            cmd.type = bundle.type;
            matchList.push(cmd);
          }
        }
      }
    }
    return matchList;
  };

  this.residue = [];
  this.longMatch = function (keys) {
    matchList = [];
    var commandList = this.commandList;
    var fsm = this.fsm;
    for (var i=0; i<commandList.length; i++) {
      var bundle = commandList[i];

      if (fsm.can(bundle.type)) {
        for (var j=0; j<bundle.commands.length; j++) {
          var cmd = bundle.commands[j];

          if (compareLongKeys(cmd.keys, keys)) {
            cmd.type = bundle.type;
            matchList.push(cmd);
          }
        }
      }
    }
    return matchList;
  };
  function compareLongKeys(a, b) {
    if (a.length != b.length)
      return false;
    for (var i=0; i<a.length; i++) {
      if (a[i] != b[i])
        return false;
    }
    return true;
  }
  this.a = compareLongKeys;
}
CommandHelper.prototype = {
  matchCommand: function(key) {

    var fsm = this.fsm;
    var commandList = this.commandList;

    // First look for one-key simple match.
    var matchList = this.simpleMatch(key);
    if (matchList.length > 1) {
      throw ("More than one commands match:" + key);
    }
    else if (matchList.length == 1) {
      var match = matchList[0];
      fsm[match.type](match);
      return match;
    }

    this.residue.push(key);
    matchList = this.longMatch(this.residue);
    if (matchList.length > 1) {
      throw ("More than one commands match:" + key);
    }
    else if (matchList.length == 1) {
      this.residue = [];
      var match = matchList[0];
      fsm[match.type](match);
      return match;
    }

    return undefined;
  },
  done: function() {
    this.fsm.done();
  }
}

var commandHelper = new CommandHelper(commandListEN);

