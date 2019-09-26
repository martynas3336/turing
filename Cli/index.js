const blessed = require('blessed');
const hasOwnProperty = function(o, prop) {
  return Object.prototype.hasOwnProperty.call(o, prop);
}
const isObject = function (o) {
  if (o === null || o === undefined) {
    return false;
  }
  const instanceOfObject = o instanceof Object;
  const typeOfObject = typeof o === 'object';
  const constructorUndefined = o.constructor === undefined;
  const constructorObject = o.constructor === Object;
  const typeOfConstructorObject = typeof o.constructor === 'function';
  return (instanceOfObject || typeOfObject) && (constructorUndefined || constructorObject);
}

class Cli
{
  constructor() {
    this.screen = {};
    this.content = {};
    this.cli = {};
    this.outputCli = {};
    this.inputCli = {};
    this.genScreen();
    this.genContent();
    this.genCli();
    this.genOutputCli();
    this.genInputCli();
    this.inputCli.focus();
    this.screen.render();
  }

  genScreen() {
    this.screen = blessed.screen({
      smartCSR: true,
      autoPadding:true
    });
    this.screen.title = 'Turing';
    this.screen.key(['C-c'], function(ch, key) {
      return process.exit(0);
    });
  }

  genContent() {
    this.content = blessed.box({
      parent:this.screen,
      tags:true,
      top:'0',
      width:'100%',
      height:'60%',

      padding: {
        top:1,
        bottom:1,
        left:2,
        right:2
      },

      scrollable:true,
      alwaysScroll:true,
      scrollbar:{
        bg:'red'
      },
      mouse:true,

      border: {
        type:'line',
        fg:'red'
      },

      style:{
        fg:'white'
      }
    });
  }

  genCli() {
    this.cli = blessed.box({
      parent:this.screen,
      bottom:'0',
      width:'100%',
      height:'40%',
    });
  }

  genOutputCli() {
    this.outputCli = blessed.log({
      parent:this.cli,
      top:'0',
      width:'100%',
      height:'60%',
      padding: {
        top:1,
        bottom:1,
        left:2,
        right:2
      },

      border: {
        type: 'line',
        fg:'green',
      },

      scrollable:true,
      alwaysScroll:true,
      scrollbar:{
        bg:'green'
      },
      scrollOnInput:true,

      mouse:true,
    });

  }

  genInputCli() {
    this.inputCli = blessed.textarea({
      parent:this.cli,
      bottom: '0',
      width: '100%',
      height: '40%',
      padding: {
        top:1,
        bottom:1,
        left:2,
        right:2
      },

      border: {
        type: 'line',
        fg:'blue',
      },

      scrollable:true,
      alwaysScroll:true,
      scrollbar:{
        bg:'blue'
      },
      mouse:true,

      inputOnFocus:true,

      style:{
        fg:'white'
      }
    });

    this.inputCli.key(['C-c'], (ch, key) => {
      return process.exit(0);
    });
  }

  async output(m) {
    if(isObject(m) && hasOwnProperty(m, 'message'))
    {
      this.outputCli.pushLine(m.message);
    } else if(isObject(m) && hasOwnProperty(m, 'errMessage'))
    {
      this.outputCli.pushLine(m.errMessage);
    } else if(m instanceof Error)
    {
      this.outputCli.pushLine('SOMETHING WENT WRONG');
      // this.outputCli.pushLine(m.message);
    } else {
      this.outlitCli.pushLine('SOMETHING WENT WRONG');
    }
    this.screen.render();
  }

}

module.exports = Cli;
