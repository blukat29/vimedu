
var state_display = $("#state-display");
var helps_display = $("#helps-display");

var commandListEN = [
  // Motion commands. Can be used alone, or used with operator.
  { keys:['h'],     type:'motion',   help:'to left' },
  { keys:['j'],     type:'motion',   help:'to down' },
  { keys:['k'],     type:'motion',   help:'to up' },
  { keys:['l'],     type:'motion',   help:'to right' },

  { keys:['w'],     type:'motion',   help:'a word' },
  { keys:['b'],     type:'motion',   help:'a word backward' },

  { keys:['0'],     type:'motion',   help:'to start of line' },
  { keys:['$'],     type:'motion',   help:'to end of line' },

  // Operator commands. Always used with either (i) motion,
  // (ii) a modifier + text-object (iii) itself, meaning linewise operation.
  { keys:['d'],     type:'operator', help:'Delete' },
  { keys:['y'],     type:'operator', help:'Yank (copy)' },

  // Action commands. Always used alone. Each one is complete as itself.
  { keys:['<Esc>'], type:'action',   help:'Exit to normal mode' },
  { keys:['i'],     type:'action',   help:'Switch to insert mode' },
  { keys:['x'],     type:'action',   help:'Delete a character' },
  { keys:['u'],     type:'action',   help:'Undo' },
];

function VimFSM() {
  var fsm = StateMachine.create({
    initial:'_none',
    events: [
      { name:'motion',   from:'_none',     to:'_motion'   },
      { name:'motion',   from:'_operator', to:'_motion'   },
      { name:'operator', from:'_none',     to:'_operator' },
      { name:'action',   from:'_none',     to:'_action'   },
      { name:'done',     from:'*',         to:'_none'     },
  ]});

  fsm.onenterstate = function(e, from, to) {
    state_display.html(from + " -> " + to);
  };
  fsm.onleave_none = function(e, from, to) {
    helps_display.html("");
  }

  fsm.on_motion = function(e, from, to, command) {
    helps_display.append("<br>"+command.help);
  };

  fsm.on_operator = function(e, from, to, command) {
    helps_display.append("<br>"+command.help);
  };

  fsm.on_action = function(e, from, to, command) {
    helps_display.append("<br>"+command.help);
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

