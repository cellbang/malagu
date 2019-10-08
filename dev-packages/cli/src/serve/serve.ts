
import * as program from 'commander';
import { ServeManager } from './serve-manager';
import { CliContext, HookContext } from '../context';

program
    .name('malagu serve')
    .usage('[options]')
    .option('-o, --open [open]', 'Open browser')
    .option('-c, --copy [copy]', 'Copy local url to clipboard')
    .option('-p, --port [port]', 'Port used by the server', 3000)
    .description('serve a applicaton')
    .parse(process.argv);

(async () => {
    const cliContext = await CliContext.create(program);
    cliContext.dev = true;
    cliContext.open = program.open;
    cliContext.copy = program.copy;
    cliContext.port = program.port;
    const hookContext = await HookContext.create(cliContext);
    if (hookContext.configurations.length === 0) {
        throw new Error('No malagu module found.');
    }
    new ServeManager(hookContext).start();

})();
