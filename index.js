const commander = require('commander');
const Cli = require('./Cli');
const Main = require('./Main');

commander
.option('-r, --run', 'Run the program')
.option('-l, --load <file directory>', 'Load selected files')
.option('-a, --autostart', 'Autostart on load')
.option('-t, --timeout <delay>', 'Timeout between each step')

commander.parse(process.argv);

if(commander.run) {
  let cli = new Cli();
  let main = new Main(cli);
  if(commander.load)
  {
    main.load({_path:commander.load, loopDirectory:true, autostart:commander.autostart, timeOut:commander.timeout}).catch((err) => {
      cli.output(err);
    });
  }
  main.listen();
}
