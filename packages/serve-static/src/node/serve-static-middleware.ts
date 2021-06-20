import { Middleware, Context, RequestMatcher } from '@malagu/web/lib/node';
import s from '../serve-static/index';
import { Value, Component, Autowired } from '@malagu/core';
import { HTTP_MIDDLEWARE_PRIORITY } from '@malagu/web/lib/node';
import { SERVER_PATH, HttpMethod, MediaType, HttpHeaders } from '@malagu/web';
import { OutgoingMessage } from 'http';
// import * as compression from 'compression';
@Component(Middleware)
export class ServeStaticMiddleware implements Middleware {
    @Value('malagu["server"]["path"]')
    protected baseHref: string;

    @Value('malagu["serve-static"]')
    protected config: { spa: boolean, root: string, path: string, apiPath: string, options: any};

    @Value(SERVER_PATH)
    protected path: string;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        console.log('waiwei', ctx.request.url);
        this.config.options.baseHref = this.baseHref;
        const method = ctx.request.method;

        if (!(method === HttpMethod.GET || method === HttpMethod.HEAD) || ctx.request.query['static'] === 'skip') {
            ctx.request.url = ctx.request.url.replace(this.baseHref, '/');
            await next();
            return;
        }

        if (this.config.apiPath && await this.requestMatcher.match(this.config.apiPath)) {
            await next();
            return;
        }

        if (this.config.path && !await this.requestMatcher.match(this.config.path)) {
            await next();
            return;
        }

        const executor = (resolve: any, reject: any) => {
            const opts = this.config.options;
            if (!opts.setHeaders) {
                opts.setHeaders = (res: OutgoingMessage, path: string) => {
                    if (opts.headers) {
                        Object.keys(opts.headers).forEach(key => res.setHeader(key, opts.headers[key]));
                    }
                    if ((s.mime as any).lookup!(path) === MediaType.TEXT_HTML) {
                        // Custom Cache-Control for HTML files
                        res.setHeader(HttpHeaders.CACHE_CONTROL, `public, max-age=${opts.htmlMaxAge / 1000}`);
                    }
                };
            }

            s.serveStatic(this.config.root, this.config.options)(ctx.request as any, ctx.response as any, ((err: any) => {
                const url = ctx.request.url;
                if (url !== '/index.html') {
                    if (!this.config.spa) {
                        return;
                    }
                    ctx.request.url = '/index.html';
                    executor(resolve, reject);
                } else if (err) {
                    reject(err);
                } else {
                    next().then(resolve).catch(reject);
                }
            }) as any);
        };

        return new Promise(executor);
    }
    priority = HTTP_MIDDLEWARE_PRIORITY + 500;

}
