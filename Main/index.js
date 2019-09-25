const commander = require('commander');
const fs = require('fs');
const path = require('path');
const Turing = require('../Turing');

class Main {
  constructor(cli) {
    this.cli = cli;
  }

  async load({_path, loopDirectory, autostart}) { return new Promise((resolve, reject) => {
    fs.stat(_path, (err, stats) => {
      if(err)
      {
        return reject({errMessage:'UNEXPECTED ERROR.'});
      }

      if(!stats.isFile() && !stats.isDirectory())
      {
        return reject({errMessage:`${_path} IS NEITHER A FILE OR A DIRECTORY`});
      }

      if(stats.isFile())
      {
        fs.readFile(_path, 'utf8', (err, file) => {
          if(err)
          {
            return reject({errMessage:'UNEXPECTED ERROR'})
          }
          Turing.load({instructions:[file], autostart, cli:this.cli}).catch((err) => {
            cli.output(err);
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
              this.load({_path:`${_path}/${file}`, autostart}).catch((err) => {
                cli.output(err);
              })
            })
          })
        }
      }
      return resolve();
    })
  })}

  async listen() {

  }
}

module.exports = Main;
