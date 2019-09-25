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
    this.content = blessed.layout({
      lauout:'block',
      top:'0',
      width:'100%',
      height:'75%',

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
    this.screen.append(this.content);
  }

  genCli() {
    this.cli = blessed.box({
      bottom:'0',
      width:'100%',
      height:'25%',
    });
    this.screen.append(this.cli);
  }

  genOutputCli() {
    this.outputCli = blessed.log({
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

    this.cli.append(this.outputCli);
  }

  genInputCli() {
    this.inputCli = blessed.textarea({
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

    this.inputCli.key(['C-c'], function(ch, key) {
      return process.exit(0);
    });

    this.cli.append(this.inputCli);
  }

  line() {
    return blessed.box({
      tags:true,
      width:'100%',
      padding: {
        bottom:1
      }
    })
  }

  async output(m) {
    if(isObject(m) && hasOwnProperty(m, 'message'))
    {
      this.outputCli.pushLine(m.message);
    }

    if(isObject(m) && hasOwnProperty(m, 'errMessage'))
    {
      this.outputCli.pushLine(m.errMessage);
    }

    if(m instanceof Error)
    {
      this.outputCli.pushLine(m);
    }
    this.screen.render();
  }

}

module.exports = Cli;
