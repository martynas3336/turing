const blessed = require('blessed');
let __machines__ = [];


const replaceAt = function(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}

class Turing {

  constructor({id, instructions, cli}) {
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
    this.permaStopped = false;

    this.lastSavedStep = {};
    this.line = cli.line();
  }

  async setTimeout(timeout) { return new Promise((resolve, reject) => {
    this.timeout = timeout;
    this.cli.output({message:`NEW TIMEOUT (${timeout}) HAS BEEN SET: ${id}`});
    return resolve();
  })}

  async start() { return new Promise((resolve, reject) => {
    this.cli.output({message:`STARTING MACHINE: ${this.id}`});
    this.cli.output({message:`DECODING DATA: ${this.id}`});
    this.decodeInstructions().then(() => {
      this.cli.output({message:`SUCCESSFULLY DECODED: ${this.id}`});
      this.cli.output({message:`VALIDATING DATA: ${this.id}`});
      this.validateInstructions().then(() => {
        this.cli.output({message:`DATA IS VALID: ${this.id}`});
        this.cli.output({message:`MACHINE STARTED: ${this.id}`});
        this.line.setContent(this.outputTape);
        this.cli.content.append(this.line);
        this.cli.screen.render();
        resolve();
        this.currentPosition = this.startingPosition-1;
        this.next({}).catch((err) => {
          console.log(err);
          this.cli.output(err);
        });
        return;
      }).catch((err) => {
        this.cli.output(err);
        this.constructor.remove({id:[this.id], cli:this.cli}).catch((err) => {
          this.cli.output(err);
        })
        return resolve();
      })
    }).catch((err) => {
      this.cli.output({errMessage:`UNABLE TO DECODE THE FILE: ${this.id}`});
      this.constructor.remove({id:[this.id], cli:this.cli}).catch((err) => {
        this.cli.output(err);
      });
      return resolve();
    })
    this.started = true;
  })}

  async decodeInstructions() { return new Promise((resolve, reject) => {
    let lines = this.instructions.split("\r\n");
    this.startingPosition = parseInt(lines[0]);
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
        return reject({errMessage:`INVALID STARTING POSITION: ${this.startingPosition}`});
      }
      return resolve();
    })})

    // # CHECK IF ALL COMMANDS HAVE 4 VALUES
    .then(() => { return new Promise((resolve, reject) => {
      this.commands.forEach((c) => {
        if(c.length !== 5)
        {
          return reject({errMessage:`INVALID COMMAND: ${JSON.stringify(c)}`});
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
          return reject({errMessage:`INVALID DIRECTION: ${c[3]}`})
        }
      })
      return resolve();
    })})

    .then(() => { return resolve(); })
    .catch((err) => { return reject(err); })


  })}

  async next({command=null, state=0, markDone=false}) { return new Promise((resolve, reject) => {
    this.lastSavedStep = {command, state, markDone};
    if(this.started === true && this.stopped === false && this.permaStopped === false)
    {

      if(this.currentPosition < 0 || this.currentPosition >= this.outputTape.length)
      {
        this.cli.output({message:`END OF TAPE: ${this.id}`});
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
          this.cli.output({errMessage:`INVALID NEXT STATE: state: ${state}, current symbol: ${currentSymbol}`})
          return resolve();
        }
      } else {
        _command = command;
      }

      if(markDone === false)
      {
        let lineContent = replaceAt(this.outputTape, this.currentPosition, `{red-fg}${currentSymbol}{/}`);
        this.line.setContent(`${this.id}:  ${lineContent}`);
        this.cli.screen.render();
        resolve();
        setTimeout(this.next.bind(this), this.timeout, {command:_command, state, markDone:true})
        return;
      } else {
        this.outputTape = replaceAt(this.outputTape, this.currentPosition, (_command[3] === '*' ? currentSymbol : _command[2]));
        let lineContent = replaceAt(this.outputTape, this.currentPosition, (`{red-fg}${this.outputTape[this.currentPosition]}{/}`));

        this.line.setContent(`${this.id}:  ${lineContent}`);
        this.cli.screen.render();
        resolve();
        if(_command[3] === 'R')
        {
          this.currentPosition++;
        } else {
          this.currentPosition--;
        }
        setTimeout(this.next.bind(this), this.timeout, {state:_command[4]})
        return;
      }
    } else {
      return resolve();
    }
  })}

  async stop() { return new Promise((resolve, reject) => {
    if(this.started === true && this.permaStopped !== true)
    {
      this.stopped = true;
    }
    this.cli.output({message:`MACHINE HAS BEEN STOPPED: ${JSON.stringify(this.id)}`});
    return resolve();
  })}

  async permaStop() { return new Promise((resolve, reject) => {
    this.permaStopped = true;
    this.cli.output({message:`MACHINE HAS BEEN PERMASTOPPED: ${JSON.stringify(id)}`});
    return resolve();
  })}

  async resume() { return new Promise((resolve, reject) => {
    if(this.started === true && this.permaStopped !== true)
    {
      this.stopped = false;
      this.next(this.lastSavedStep);
      this.cli.output({message:`MACHINE HAS BEEN RESUMED: ${JSON.stringify(id)}`});
    }
    return resolve();
  })}

  async reset() { return new Promise((resolve, reject) => {
    this.stopped = true;
    this.lastSavedStep = {};
    this.line.setContent(tape);
    this.cli.screen.render();
    this.cli.output({message:`MACHINE HAS BEEN RESET: ${JSON.stringify(id)}`});
    return resolve();
  })}

  async remove() { return new Promise((resolve, reject) => {
    this.stop().then(() => {
      this.line.detach();
      this.cli.screen.render();
      this.cli.output({message:`MACHINE HAS BEEN REMOVED ${JSON.stringify(this.id)}`});
      return resolve();
    }).catch((err) => {
      return reject(err);
    })
  })}



  static async load({instructions, autostart, cli, timeout}) { return new Promise((resolve, reject) => {
    let machineIds = [];
    let machines = instructions.map(i => new Turing({instructions:i, id:__machines__.length, cli}));
    instructions.forEach((instruction) => {
      let id = __machines__.length;
      let machine = new Turing({instructions:instruction, id, cli});
      __machines__.push(machine);
      machineIds.push(id);
    })
    cli.output({message:`LOADING NEW MACHINE(S): ${machineIds}`});
    if(timeout)
    {
      this.setTimeout({id:machineIds, timeout, cli}).catch((err) => {
        cli.output(err);
      })
    }
    if(autostart)
    {
      this.start({id:machineIds, cli}).catch((err) => {
        cli.output(err);
      });
    }
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

  static async permaStop({id, cli}) { return new Promise((resolve, reject) => {
    this.findMachines({id:id, cli}).then((machines) => {
      Promise.all(machines.map(machine => machine.permaStop())).then(() => {
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
      Promise.all(machines.map(machines => machine.resume())).then(() => {

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
      Promise.all(machines.map(machine => machine.remove())).then(() => {
        id.forEach((id) => {
          __machines__.splice(id, 1);
        })
        return resolve();
      }).catch((err) => {
        return reject(err);
      })
    }).catch((err) => {
      return reject(err);
    })
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
          return reject({errMessage:`NO MATCHING MACHINES: ${id}`});
        }
      }
    }).catch((err) => {
      return reject(err);
    })
  })}

  static async validateMachineId({id, cli}) { return new Promise((resolve, reject) => {
    let invalidId = id.filter(id => id < 0 || id > __machines__.length);
    if(invalidId.length !== 0)
    {
      return reject({errMessage:`INVALIDE MACHINE ID: ${JSON.stringify(invalidId)}`});
    } else {
      return resolve();
    }
  })}

}


module.exports = Turing;
