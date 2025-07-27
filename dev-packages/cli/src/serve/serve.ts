
import { ServeManager } from './serve-manager';
import { CliContext, ContextUtils } from '@celljs/cli-common/lib/context/context-protocol';

export interface ServeOptions {
    port?: string;
    command?: string;
}

export default async (ctx: CliContext, options: ServeOptions) => {
    try {
        process.argv = [process.argv[0], process.argv[1]];
        if (options.command) {
            // Replace process.argv with custom command arguments, keeping original first two items
            const args = options.command.split(' ').filter(Boolean);
            if (args[0] === '@') {
                args.shift();
            }
            process.argv = process.argv.concat(args);
        }
        ctx.options = options;
        ctx = ContextUtils.mergeContext(ctx, { dev: true, ...options });
        await new ServeManager(ctx).start();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
