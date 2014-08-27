
var state_display = $("#state-display");
var helps_display = $("#helps-display");

var commandListEN = [
  // Motion commands. Can be used alone, or used with operator.
  { keys:['h'],     type:'motion',   help:'to left' },
  { keys:['j'],     type:'motion',   help:'to down' },
  { keys:['k'],     type:'motion',   help:'to up' },
  { keys:['l'],     type:'motion',   help:'to right' },
  { keys:['<Left>'],  type:'motion',   help:'to left' },
  { keys:['<Down>'],  type:'motion',   help:'to down' },
  { keys:['<Up>'],    type:'motion',   help:'to up' },
  { keys:['<Right>'], type:'motion',   help:'to right' },

  { keys:['w'],     type:'motion',   help:'a word' },
  { keys:['b'],     type:'motion',   help:'a word backward' },

  { keys:['0'],     type:'motion',   help:'to start of line' },
  { keys:['$'],     type:'motion',   help:'to end of line' },

  // Operator commands. Always used with either (i) motion,
  // (ii) a modifier + text-object (iii) itself, meaning linewise operation.
  { keys:['d'],     type:'operator', help:'Delete' },
  { keys:['y'],     type:'operator', help:'Yank (copy)' },
  { keys:['c'],     type:'operator', help:'Change' },
  { keys:['p'],     type:'operator', help:'Paste' },
  { keys:['>'],     type:'operator', help:'Indent' },
  { keys:['<'],     type:'operator', help:'Unindent' },

  // Action commands. Always used alone. Each one is complete as itself.
  { keys:['<Esc>'], type:'action',   help:'Exit to normal mode' },
  { keys:['i'],     type:'action',   help:'Switch to insert mode' },
  { keys:['v'],     type:'action',   help:'Switch to visual mode' },
  { keys:['x'],     type:'action',   help:'Delete a character' },
  { keys:['u'],     type:'action',   help:'Undo' },

  // Modifiers. Used before text object.
  { keys:['a'],     type:'modifier', help:'Around' },
  { keys:['i'],     type:'modifier', help:'Inside' },

  // Text objects. Used after a modifier.
  { keys:['w'],     type:'textobj',  help:'Word' },
  { keys:['s'],     type:'textobj',  help:'Sentence' },
  { keys:['p'],     type:'textobj',  help:'Paragraph' },
  { keys:['"'],     type:'textobj',  help:'Dobule quote' },
  { keys:['\''],    type:'textobj',  help:'Single quote' },
  { keys:['`'],     type:'textobj',  help:'Back quote' },
  { keys:['('],     type:'textobj',  help:'Parenthesis' },
  { keys:[')'],     type:'textobj',  help:'Parenthesis' },
  { keys:['{'],     type:'textobj',  help:'Braces' },
  { keys:['}'],     type:'textobj',  help:'Braces' },
  { keys:['['],     type:'textobj',  help:'Brackets' },
  { keys:[']'],     type:'textobj',  help:'Brackets' },
];

function appendCommand(key, help) {
  var div = $("#helps-display");
  var kbd = $("<div><kbd>"+key+"</kbd></div>");
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
      { name:'done',     from:'*',         to:'_none'            },
  ]});

  fsm.onenterstate = function(e, from, to) {
    state_display.html(from + " -> " + to);
  };
  fsm.onleave_none = function(e, from, to) {
    helps_display.html("");
  }

  fsm.on_simpleMotion = function(e, from, to, command) {
    appendCommand(command.keys[0], "Move "+command.help);
  };

  fsm.on_operator = function(e, from, to, command) {
    appendCommand(command.keys[0], command.help);
  };
  fsm.on_operatorLinewise = function(e, from, to, command) {
    appendCommand(command.keys[0], "this line");
  };
  fsm.on_operatorsMotion = function(e, from, to, command) {
    appendCommand(command.keys[0], command.help);
  };

  fsm.on_action = function(e, from, to, command) {
    appendCommand(command.keys[0], command.help);
  };

  fsm.on_modifier = function(e, from, to, command) {
    appendCommand(command.keys[0], command.help);
  };
  fsm.on_textobj = function(e, from, to, command) {
    appendCommand(command.keys[0], command.help);
  };
  return fsm;
}

function CommandHelper (commandList) {
  this.commandList = commandList;
  this.fsm = VimFSM();
}
CommandHelper.prototype = {
  matchCommand: function(key) {

    var fsm = this.fsm;
    var commandList = this.commandList;
    var matchList = [];

    for (var i=0; i<commandList.length; i++) {
      command = commandList[i];
      if (command.keys[0] == key && fsm.can(command.type)) {
        matchList.push(command);
      }
    }

    var match;
    if (matchList.length == 0) {
      throw ("No match found:"+key)
    }
    else if (matchList.length == 1) {
      match = matchList[0];
      fsm[match.type](match);
    }
    else
      throw ("More than one commands match:"+key)
    return match;
  },
  done: function() {
    this.fsm.done();
  }
}

var commandHelper = new CommandHelper(commandListEN);

