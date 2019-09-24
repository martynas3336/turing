const commander = require('commander');
const blessed = require('blessed');
const fs = require('fs');
const path = require('path');

const listDir = function(_path) { return new Promise((resolve, reject) => {
  fs.readdir(_path, (err, files) => {
    if(err)
    {
      return reject({errMessage:'UNEXPECTED ERROR.'});
    }
    return resolve(files);
  })
})}

const fsStat = function(_path) { return new Promise((resolve, reject) => {
  fs.stat(_path, (err, stats) => {
    if(err)
    {
      console.log(_path);
      return reject({errMessage:'UNEXPECTED ERROR.'});
    }
    return resolve(stats);
  })
})}

const readFile = function(_path) { return new Promise((resolve, reject) => {
  // fs.readdir(path.join(process.cwd(), dir), 'utf8', (err, data) => {
  fs.readFile(path.join(process.cwd(), _path), 'utf8', (err, data) => {
    if(err)
    {
      return reject({errMessage:`ERROR WHILE READING FILE: ${_path}`});
    }
    return resolve(data);
  })
})}

const readFileDir = function(_path) { return new Promise((resolve, reject) => {

  let data = [];
  let stats = {};

  Promise.resolve()

  // # GET STATS ABOUT THE PATH
  .then(() => { return new Promise((resolve, reject) => {
    fsStat(_path).then((res) => {
      stats = res;
      if(!stats.isFile() && !stats.isDirectory)
      {
        return reject({errMessage:`${dir} IS NEITHER A FILE OR A DIRECTORY`});
      }
      return resolve();
    }).catch((err) => {
      return reject(err);
    })
  })})

  .then(() => { return new Promise((resolve, reject) => {
    // # READ FILE
    if(stats.isFile())
    {
      readFile(_path).then((res) => {
        data.push(res);
        return resolve();
      }).catch((err) => {
        return reject(err);
      })
    } else {
      // # LIST DIR AND READ FILE INDIVIDUALLY
      listDir(_path).then((res) => {

        Promise.all(res.map((file) => {
          return new Promise((resolve, reject) => {
            fsStat(`${_path}/${file}`).then((res) => {

              if(res.isFile())
              {
                readFile(`${_path}/${file}`).then((res) => {
                  data.push(res);
                  return resolve();
                }).catch((err) => {
                  return reject(err);
                })
              } else {
                return resolve();
              }


            }).catch((err) => {
              return reject(err);
            })
          })
        })).then((res) => {
          return resolve();
        }).catch((err) => {
          return reject(err);
        })

      }).catch((err) => {
        return reject(err);
      })
    }
  })})

  .then(() => { return resolve(data); })
  .catch((err) => { return reject(err); })

})}


commander
.option('-r, --run', 'Run the program')
.option('-l, --load <file directory>', 'Load selected files')
.option('-a, --autostart', 'Autostart on load');

commander.parse(process.argv);
if(commander.run) {

// const screen = blessed.screen({
//   smartCSR: true,
//   autoPadding:true
// });
//
// screen.title = 'Turing';
//
// let content = blessed.box({
//   top:'0',
//   width:'100%',
//   height:'75%',
//
//   padding: {
//     top:1,
//     bottom:1,
//     left:2,
//     right:2
//   },
//
//   scrollable:true,
//   alwaysScroll:true,
//   scrollbar:{
//     bg:'red'
//   },
//   mouse:true,
//
//   border: {
//     type:'line',
//     fg:'red'
//   },
//
//   style:{
//     fg:'white'
//   }
// })
//
// let cli = blessed.box({
//   bottom:'0',
//   width:'100%',
//   height:'25%',
// });
//
// let cliOld = blessed.box({
//   top:'0',
//   width:'100%',
//   height:'50%',
//   padding: {
//     top:1,
//     bottom:1,
//     left:2,
//     right:2
//   },
//
//   border: {
//     type: 'line',
//     fg:'green',
//   },
//
//   scrollable:true,
//   alwaysScroll:true,
//   scrollbar:{
//     bg:'green'
//   },
//   mouse:true,
// })
//
//
//
// let cliNew = blessed.textarea({
//   bottom: '0',
//   width: '100%',
//   height: '50%',
//   padding: {
//     top:1,
//     bottom:1,
//     left:2,
//     right:2
//   },
//
//   border: {
//     type: 'line',
//     fg:'blue',
//   },
//
//   scrollable:true,
//   alwaysScroll:true,
//   scrollbar:{
//     bg:'blue'
//   },
//   mouse:true,
//
//   inputOnFocus:true,
//
//   style:{
//     fg:'white'
//   }
// })
//
// cliNew.key(['C-c'], function(ch, key) {
//   return process.exit(0);
// });
//
// cli.append(cliOld);
// cli.append(cliNew);
//
// screen.append(content);
// screen.append(cli);
//
//
// screen.key(['C-c'], function(ch, key) {
//   return process.exit(0);
// });
// // screen.render();
// cliNew.focus();
//
//
// const Turing = require('./Turing')({screen, content, cliOld, cliNew});

const Turing = require('./Turing')();


if(commander.load)
{
  readFileDir(commander.load).then((res) => {
    Turing.load(res);
  }).catch((err) => {
    console.log(err);
  })

}

// cliNew.key('enter', () => {
//
// })

}
