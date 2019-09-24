module.exports = function({screen, content, cliOld, cliNew}={}) {
  let __machines__ = [];

  class Turing {

    constructor({id, instructions}) {
      this.id = id;
      this.instructions = instructions;
      this.started = false;
      this.stopped = false;
    }

    async start() { return new Promise((resolve, reject) => {
      this.started = true;
    })}

    async next() { return new Promise((resolve, reject) => {

    })}

    async stop() { return new Promise((resolve, reject) => {
      this.stopped = true;
      return resolve();
    })}

    async resume() { return new Promise((resolve, reject) => {
      this.stopped = false;
      return resolve();
    })}

    async reset() { return new Promise((resolve, reject) => {

    })}

    async remove() { return new Promise((resolve, reject) => {
      this.stop().then(() => {
        return resolve();
      }).catch((err) => {
        return reject(err);
      })
    })}



    static load(instructions) { return new Promise((resolve, reject) => {
      instructions.forEach((instruction) => {
        __machines__.push(new Turing({instruction, id:__machines__.length}));
      })
      return resolve({message:`NEW MACHINES HAVE BEEN LOADED`})
    })}

    static start(id) { return new Promise((resolve, reject) => {
      this.findMachines(i).then((machines) => {
        Promise.all(machines.map(machine => machine.start())).then(() => {
          return resolve({message:`MACHINE HAS BEEN STARTED: ${JSON.stringify(id)}`});
        }).catch((err) => {
          return reject(err);
        })
      }).catch((err) => {
        return reject(err);
      })
    })}

    static stop(id) { return new Promise((resolve, reject) => {
      this.findMachines(i).then((machines) => {
        Promise.all(machines.map(machine => machines.stop())).then(() => {
          return resolve({message:`MACHINE HAS BEEN STOPPED: ${JSON.stringify(id)}`});
        }).catch((err) => {
          return reject(err);
        })
      }).catch((err) => {
        return reject(err);
      })
    })}

    static resume(id) { return new Promise((resolve, reject) => {
      this.findMachines(i).then((machines) => {
        Promise.all(machines.map(machines => machines.resume())).then(() => {
          return resolve({message:`MACHINE HAS BEEN RESUMED: ${JSON.stringify(id)}`});
        }).catch((err) => {
          return reject(err);
        })
      }).catch((err) => {
        return reject(err);
      })
    })}

    static reset(id) { return new Promise((resolve, reject) => {
      this.findMachines(id).then((machines) => {
        Promise.all(machines.map(machine => machine.reset())).then(() => {
          return resolve({message:`MACHINE HAS BEEN RESET: ${JSON.stringify(id)}`});
        }).catch((err) => {
          return reject(err);
        })
      }).catch((err) => {
        return reject(err);
      })
    })}

    static remove(id) { return new Promise((resolve, reject) => {

      this.findMachines(id).then((machines) => {
        Promise.all(machines.map(machine => machine.remove())).then(() => {
          id.forEach((id) => {
            __machines__.splice(i, 1);
          })
          return resolve({message:`MACHINE HAS BEEN REMOVED ${JSON.stringify(id)}`});
        }).catch((err) => {
          return reject(err);
        })
      }).catch((err) => {
        return reject(err);
      })
    })}

    static findMachines(id) { return new Promise((resolve, reject) => {
      this.validateMachineId(id.filter(id => id !== '*')).then(() => {
        if(id.includes('*'))
        {
          return resolve(__machines__);
        } else {
          let matchinMachines = __machines__.filter(machine => id.includes(machine.id));
          if(matchinMachines.length !== 0)
          {
            return resolve(matchingMachines);
          } else {
            return reject(`NO MATCHING MACHINES: ${id}`);
          }
        }
      }).catch((err) => {
        return reject(err);
      })
    })}

    static validateMachineId(id) { return new Promise((resolve, reject) => {
      let invalidId = i.filter(id => i < 0 || id > __machines__.length);
      if(invalidId.length !== 0)
      {
        return reject({errMessage:`INVALIDE MACHINE ID: ${JSON.stringify(invalidId)}`});
      } else {
        return resolve();
      }
    })}




  }


  return Turing;
}
