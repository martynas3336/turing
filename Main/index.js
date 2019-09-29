const commander = require('../commander');
const fs = require('fs');
const path = require('path');
const Turing = require('../Turing');

class Main {
  constructor(cli) {
    this.cli = cli;
  }

  async load({_path, loopDirectory, timeout, autostart}) { return new Promise((resolve, reject) => {
    fs.stat(_path, (err, stats) => {
      if(err)
      {
        return reject({errMessage:'SYSTEM: UNEXPECTED ERROR.'});
      }

      if(!stats.isFile() && !stats.isDirectory())
      {
        return reject({errMessage:`SYSTEM: ${_path} IS NEITHER A FILE OR A DIRECTORY`});
      }

      if(stats.isFile())
      {
        fs.readFile(_path, 'utf8', (err, file) => {
          if(err)
          {
            return reject({errMessage:'SYSTEM: UNEXPECTED ERROR'})
          }
          Turing.load({instructions:[file], autostart, timeout, cli:this.cli, name:_path}).catch((err) => {
            // console.log(err);
            this.cli.output(err);
          })
        })
      }
      if(stats.isDirectory()) {
        if(loopDirectory)
        {
          fs.readdir(_path, (err, files) => {
            if(err)
            {
              return reject({errMessage:'UNEXPECTED ERROR'});
            }
            files.forEach((file) => {
              this.load({_path:`${_path}/${file}`, autostart, timeout}).catch((err) => {
                cli.output(err);
              })
            })
          })
        }
      }
      return resolve();
    })
  })}

  async action(_input) {
    const command = new commander.Command();

    command
    .option('-l, --load <file directory>', 'Load selected files')
    .option('-a, --autostart', 'Autostart on load')
    .option('-s, --start', 'Start')
    .option('-t, --timeout <timeout>', 'Timeout between each step')
    .option('-S, --stop', 'Stop machine')
    .option('-r, --resume', 'Resume machine')
    .option('-R, --reset', 'Reset machine')
    .option('-m, --machine <machine id>', 'Select machine')
    .option('-D, --destroy', 'Destroy machine')

    let input = [...process.argv.slice(0, 2), ..._input.split(' ')];
    try {
      command.parse(input);
    } catch(err) {
      this.cli.output({message:`SYSTEM: ${err.message}`});
      return;
    }

    if(command.load)
    {
      this.load({_path:command.load, loopDirectory:true, autostart:command.autostart, timeout:command.timeout}).catch((err) => {
        this.cli.output(err);
      });
      return;
    }

    if(command.machine)
    {
      let machineId = command.machine;
      if(command.machine !== '*')
      {
        machineId = +command.machine;
      }
      if(command.start)
      {
        Turing.start({id:[machineId], cli:this.cli}).catch((err) => {
          this.cli.output(err);
        })
      }

      if(command.timeout)
      {
        let timeout = +command.timeout || 100;
        Turing.setTimeout({id:[machineId], timeout:timeout, cli:this.cli}).catch((err) => {
          this.cli.output(err);
        })
      }

      if(command.stop)
      {
        Turing.stop({id:[machineId], cli:this.cli}).catch((err) => {
          this.cli.output(err);
        })
      }

      if(command.resume)
      {
        Turing.resume({id:[machineId], cli:this.cli}).catch((err) => {
          // console.log(err);
          this.cli.output(err);
        })
      }

      if(command.reset)
      {
        Turing.reset({id:[machineId], cli:this.cli}).catch((err) => {
          // console.log(err);
          this.cli.output(err);
        })
      }

      if(command.destroy)
      {
        Turing.remove({id:[machineId], cli:this.cli}).catch((err) => {
          // console.log(err);
          this.cli.output(err);
        })
      }
    }




  }

  async listen() {
    this.cli.inputCli.key(['enter'], (ch, key) => {
      let value = this.cli.inputCli.getValue();
      value = value.slice(0, value.length-1);
      this.cli.output({message:`CLIENT: ${value}`});
      this.cli.inputCli.clearValue('');
      this.cli.screen.render();
      this.action(value);
    })
  }
}

module.exports = Main;
