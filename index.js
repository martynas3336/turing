const commander = require('./commander');
const Cli = require('./Cli');
const Main = require('./Main');
const command = new commander.Command();

command
// .option('-r, --run', 'Run the program')
.option('-l, --load <file directory>', 'Load selected files')
.option('-a, --autostart', 'Autostart on load')
.option('-t, --timeout <timeout>', 'Timeout between each step')

try {
  command.parse(process.argv);
} catch(err) {
  console.log(err.message);
  process.exit();
}

// if(command.run) {
  let cli = new Cli();
  let main = new Main(cli);
  if(command.load)
  {
    main.load({_path:command.load, loopDirectory:true, autostart:command.autostart, timeout:command.timeout}).catch((err) => {
      cli.output(err);
    });
  }
  main.listen();
// }
