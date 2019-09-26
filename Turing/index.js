const blessed = require('blessed');
let __machines__ = [];
let __machineCount__ = 0;
let __lines__ = [];


const replaceAt = function(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}

class Line {
  constructor(cli, line) {
    this.line = line;
    this.cli = cli;
  }

  setContent(content) {
    this.cli.content.setLine(this.line, content);
    this.cli.screen.render();
  }

  static create(cli) {
    let lines = cli.content.getLines();
    let line = new Line(cli, lines.length);
    __lines__.push(line);
    return line;
  }

  static remove(cli, line) {
    cli.content.deleteLine(line);
    for(let i = 0; i < __lines__.length; i++)
    {
      if(__lines__[i].line === line)
      {
        __lines__.splice(i, 1);
        break;
      }
    }
    __lines__.forEach((_line) => {
      if(_line.line > line)
      {
        _line.line--;
      }
    })
  }
}

class Turing {

  constructor({id, instructions, cli, name}) {
    this.loaded = false;
    this.name = name;
    this.timeout = 10;
    this.id = id;
    this.instructions = instructions;
    this.cli = cli;
    this.startingPosition = 0;
    this.currentPosition = 0;
    this.tape = '';
    this.outputTape = '';
    this.commands = [];
    this.started = false;
    this.stopped = false;

    this.lastSavedStep = {};
    this.line = Line.create(cli);
  }

  async setTimeout(timeout) { return new Promise((resolve, reject) => {
    this.timeout = timeout;
    this.cli.output({message:`MACHINE ${this.id}: NEW TIMEOUT SET - ${timeout}`});
    return resolve();
  })}

  async load() { return new Promise((resolve, reject) => {
    this.cli.output({message:`MACHINE ${this.id} (${this.name}): DECODING DATA`});
    this.decodeInstructions().then(() => {
      this.cli.output({message:`MACHINE ${this.id} (${this.name}): SUCCESSFULLY DECODED`});
      this.cli.output({message:`MACHINE ${this.id} (${this.name}): VALIDATING DATA`});
      this.validateInstructions().then(() => {
        this.cli.output({message:`MACHINE ${this.id} (${this.name}): DATA IS VALID`});
        this.cli.output({message:`MACHINE ${this.id} (${this.name}): LOADED`});

        this.line.setContent(`MACHINE ${this.id} (${this.name}): ${this.outputTape}`);

        this.currentPosition = this.startingPosition-1;
        this.cli.screen.render();
        this.loaded = true;
        return resolve();
      }).catch((err) => {
        this.cli.output(err);
        this.constructor.remove({id:[this.id], cli:this.cli}).catch((err) => {
          this.cli.output(err);
        })
        return resolve();
      })
    }).catch((err) => {
      this.cli.output({errMessage:`MACHINE ${this.id} (${this.name}): UNABLE TO DECODE THE FILE`});
      this.constructor.remove({id:[this.id], cli:this.cli}).catch((err) => {
        this.cli.output(err);
      });
      return resolve();
    })
  })}

  async start() { return new Promise((resolve, reject) => {
    if(this.loaded === false)
    {
      this.cli.output({message:`MACHINE ${this.id} (${this.name}): LOADING`})
      return resolve();;
    }
    if(this.started === true)
    {
      this.cli.output({message:`MACHINE ${this.id} (${this.name}): ALREADY STARTED`});
      return resolve();
    }
    this.cli.output({message:`MACHINE ${this.id} (${this.name}): STARTED`});
    this.cli.screen.render();
    this.started = true;
    this.next({}).catch((err) => {
      this.cli.output(err);
    });
    return resolve();
  })}

  async decodeInstructions() { return new Promise((resolve, reject) => {
    let lines = this.instructions.split("\r\n");
    this.startingPosition = parseInt(lines[0]) || 0;
    this.tape = lines[1];
    this.outputTape = this.tape;
    this.commands = lines.slice(2);
    for(let i = this.commands.length-1; i >=0; i--)
    {
      if(this.commands[i] === '' || this.commands[i] === '\r')
      {
        this.commands.splice(i, 1);
      } else {
        this.commands[i] = this.commands[i].split(' ');
      }
    }
    return resolve();
  })}

  async validateInstructions() { return new Promise((resolve, reject) => {

    Promise.resolve()
    // # CHECK IF STARTING POSITION IS VALID
    .then(() => { return new Promise((resolve, reject) => {
      if(this.startingPosition !== this.startingPosition || this.startingPosition < 0 || this.startingPosition >= this.tape.length)
      {
        return reject({errMessage:`MACHINE ${this.id} (${this.name}): INVALID STARTING POSITION - ${this.startingPosition}`});
      }
      return resolve();
    })})

    // # CHECK IF ALL COMMANDS HAVE 4 VALUES
    .then(() => { return new Promise((resolve, reject) => {
      this.commands.forEach((c) => {
        if(c.length !== 5)
        {
          return reject({errMessage:`MACHINE ${this.id} (${this.name}): INVALID COMMAND - ${JSON.stringify(c)}`});
        }
      })
      return resolve();
    })})

    // // # CHECK IF NEXT STEP IS VALID
    // .then(() => { return new Promise((resolve, reject) => {
    //   this.commands.forEach((c) => {
    //     let match = false;
    //     this.commands.forEach((_c) => {
    //       if(c[4] === _c[0])
    //       {
    //         match = true;
    //       }
    //     })
    //     if(match === false)
    //     {
    //       return reject({errMessage:`iNVALID NEXT STEP: ${c[4]}`})
    //     }
    //   })
    //   return resolve();
    // })})

    // # CHECK IF DIRECTION IS VALID
    .then(() => { return new Promise((resolve, reject) => {
      this.commands.forEach((c) => {
        if(!['R', 'L'].includes(c[3]))
        {
          return reject({errMessage:`MACHINE ${this.id} (${this.name}): INVALID DIRECTION - ${c[3]}`})
        }
      })
      return resolve();
    })})

    .then(() => { return resolve(); })
    .catch((err) => { return reject(err); })


  })}

  async next({command=null, state=0, markDone=false}) { return new Promise((resolve, reject) => {
    if(this.stopped === true || this.started === false)
    {
      return resolve();
    }
    if(this.currentPosition < 0 || this.currentPosition >= this.outputTape.length)
    {
      this.cli.output({message:`MACHINE ${this.id} (${this.name}): END OF TAPE`});
      return resolve();
    }

    let currentSymbol = this.outputTape[this.currentPosition];

    let _command;
    if(command === null)
    {
      let matched = false;
      this.commands.forEach((c) => {
        if(c[0] === state.toString() && c[1] === currentSymbol.toString())
        {
          _command = c;
          matched = true;
        }

      })
      if(matched === false)
      {
        this.commands.forEach((c) => {
          if(c[0] === state.toString() && c[1] === '*')
          {
            _command = c;
            matched = true;
          }
        })
      }
      if(matched === false)
      {
        this.cli.output({errMessage:`MACHINE ${this.id} (${this.name}): NO RULE FOR STATE ${state} AND SYMBOL ${currentSymbol}`})
        return resolve();
      }
    } else {
      _command = command;
    }

    if(markDone === false)
    {
      let lineContent = replaceAt(this.outputTape, this.currentPosition, `{red-fg}${currentSymbol}{/}`);
      this.line.setContent(`MACHINE ${this.id} (${this.name}): ${lineContent}`);
      this.cli.screen.render();
      resolve();

      this.lastSavedStep = {command:_command, state, markDone:true};
      setTimeout(this.next.bind(this), this.timeout, {command:_command, state, markDone:true})
      return;
    } else {
      this.outputTape = replaceAt(this.outputTape, this.currentPosition, (_command[3] === '*' ? currentSymbol : _command[2]));

      let lineContent = replaceAt(this.outputTape, this.currentPosition, (`{red-fg}${this.outputTape[this.currentPosition]}{/}`));
      this.line.setContent(`MACHINE ${this.id} (${this.name}): ${lineContent}`);
      this.cli.screen.render();
      resolve();
      if(_command[3] === 'R')
      {
        this.currentPosition++;
      } else {
        this.currentPosition--;
      }
      this.lastSavedStep = {state:_command[4]};
      setTimeout(this.next.bind(this), this.timeout, {state:_command[4]})
      return;
    }
    return resolve();
  })}

  async stop() { return new Promise((resolve, reject) => {
    if(this.started === false)
    {
      this.cli.output({errMessage:`MACHINE ${this.id} (${this.name}): NOT STARTED`});
      return resolve();
    }

    if(this.stopped === true)
    {
      this.cli.output({message:`MACHINE ${this.id} (${this.name}): ALREADY STOPPED`});
      return resolve();
    }

    this.stopped = true;
    this.cli.output({message:`MACHINE ${this.id} (${this.name}): STOPPED`});

    return resolve();
  })}

  async resume() { return new Promise((resolve, reject) => {

    if(this.started === false)
    {
      this.cli.output({errMessage:`MACHINE ${this.id} (${this.name}): NOT BEEN STARTED`});
      return resolve();
    }
    if(this.stopped === false)
    {
      this.cli.output({errMessage:`MACHINE ${this.id} (${this.name}): NOT BEEN STOPPED`});
      return resolve();
    }

    this.stopped = false;
    this.cli.output({message:`MACHINE ${this.id} (${this.name}): RESUMED`});
    this.next(this.lastSavedStep).catch((err) => {
      return reject(err);
    });
    return resolve();
  })}

  async reset() { return new Promise((resolve, reject) => {
    Promise.resolve()

    .then(() => { return new Promise((resolve, reject) => {
      if(this.started === false)
      {
        this.cli.output({message:`MACHINE ${this.id} (${this.name}): WASN'T STARTED`});
        return reject();
      } else {
        return resolve();
      }
    })})

    .then(() => { return new Promise((resolve, reject) => {
      if(this.stopped === true)
      {
        return resolve(this.stop());
      } else {
        return resolve();
      }
    })})

    .then(() => { return new Promise((resolve, reject) => {
      this.started = false;
      this.stopped = false;
      this.lastSavedStep = {};
      this.outputTape = this.tape;
      this.currentPosition = this.startingPosition-1;
      this.line.setContent(`MACHINE ${this.id} (${this.name}): ${this.outputTape}`);
      this.cli.screen.render();
      this.cli.output({message:`MACHINE ${this.id} (${this.name}): RESET`});
      return resolve();
    })})

    .then(() => {
      return resolve();
    })

    .catch((err) => {
      return resolve();
    })
  })}

  async remove() { return new Promise((resolve, reject) => {
    this.stop().then(() => {
      Line.remove(this.cli, this.line.line);
      this.cli.screen.render();
      this.cli.output({message:`MACHINE ${this.id} (${this.name}): REMOVED`});
      return resolve();
    }).catch((err) => {
      return reject(err);
    })
  })}



  static async load({instructions, autostart, cli, timeout, name}) { return new Promise((resolve, reject) => {
    let machineIds = [];
    instructions.forEach((instruction) => {
      let id = __machineCount__;
      let machine = new Turing({instructions:instruction, id, cli, name});
      __machines__.push(machine);
      machineIds.push(id);
      __machineCount__++;
    })
    cli.output({message:`SYSTEM: LOADING NEW MACHINE(S) - ${machineIds} (${name})`});
    this.findMachines({id:machineIds, timeout, cli}).then((machines) => {
      machines.forEach((machine) => {
        machine.load().then(() => {
          if(timeout === true)
          {
            machine.setTimeout().catch((err) => {
              cli.output(err);
            });
          }
          if(autostart === true)
          {
            machine.start().catch((err) => {
              cli.output(err);
            });
          }
        }).catch((err) => {
          cli.output(err);
        })
      })
    }).catch((err) => {
      cli.output(err);
    })

    return resolve();
  })}

  static async setTimeout({id, timeout, cli}) { return new Promise((resolve, reject) => {
    this.findMachines({id, cli}).then((machines) => {
      Promise.all(machines.map(machine => machine.setTimeout(timeout))).then(() => {
        return resolve();
      }).catch((err) => {
        return reject(err);
      })
    }).catch((err) => {
      return reject(err);
    })
  })}

  static async start({id, cli}) { return new Promise((resolve, reject) => {
    this.findMachines({id, cli}).then((machines) => {
      Promise.all(machines.map(machine => machine.start())).then(() => {
        return resolve();
      }).catch((err) => {
        return reject(err);
      })
    }).catch((err) => {
      return reject(err);
    })
  })}

  static async stop({id, cli}) { return new Promise((resolve, reject) => {
    this.findMachines({id, cli}).then((machines) => {
      Promise.all(machines.map(machine => machine.stop())).then(() => {
        return resolve();
      }).catch((err) => {
        return reject(err);
      })
    }).catch((err) => {
      return reject(err);
    })
  })}

  static async resume({id, cli}) { return new Promise((resolve, reject) => {
    this.findMachines({id, cli}).then((machines) => {
      Promise.all(machines.map(machine => machine.resume())).then(() => {
        return resolve();
      }).catch((err) => {
        return reject(err);
      })
    }).catch((err) => {
      return reject(err);
    })
  })}

  static async reset({id, cli}) { return new Promise((resolve, reject) => {
    this.findMachines({id, cli}).then((machines) => {
      Promise.all(machines.map(machine => machine.reset())).then(() => {
        return resolve();
      }).catch((err) => {
        return reject(err);
      })
    }).catch((err) => {
      return reject(err);
    })
  })}

  static async remove({id, cli}) { return new Promise((resolve, reject) => {
    this.findMachines({id, cli}).then((machines) => {
      Promise.all(machines.map(machine => {

        return new Promise((resolve, reject) => {
          machine.remove().then(() => {
            for(let i = __machines__.length - 1; i >= 0; i--)
            {
              if(machine.id === __machines__[i].id)
              {
                __machines__.splice(i, 1);
              }
            }
          }).catch((err) => {
            cli.output(err);
          })    
        })
      })).then(() => {
        return resolve();
      }).catch((err) => {
        cli.output(err);
        return resolve();
      })
    }).catch((err) => {
      cli.output(err);
    })
    return resolve();
  })}

  static async findMachines({id, cli}) { return new Promise((resolve, reject) => {
    this.validateMachineId({id:id.filter(id => id !== '*'), cli}).then(() => {
      if(id.includes('*'))
      {
        return resolve(__machines__);
      } else {
        let matchingMachines = __machines__.filter(machine => id.includes(machine.id));
        if(matchingMachines.length !== 0)
        {
          return resolve(matchingMachines);
        } else {
          return reject({errMessage:`SYSTEM: NO MATCHING MACHINES - ${id}`});
        }
      }
    }).catch((err) => {
      return reject(err);
    })
  })}

  static async validateMachineId({id, cli}) { return new Promise((resolve, reject) => {
    let machineIds = __machines__.map(m => m.id);
    let invalidId = id.filter(id => !machineIds.includes(id));
    if(invalidId.length !== 0)
    {
      return reject({errMessage:`SYSTEM: INVALID MACHINE ID - ${invalidId}`});
    } else {
      return resolve();
    }
  })}

}


module.exports = Turing;
