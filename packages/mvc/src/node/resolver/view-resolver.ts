import { ViewResolver } from './resolver-protocol';
import { Component, Autowired, Value } from '@celljs/core';
import { ViewProvider } from '../view/view-provider';
import { ViewMetadata } from '../annotation/view';
import { Context } from '@celljs/web/lib/node';
import { HttpHeaders } from '@celljs/http';

@Component(ViewResolver)
export class ViewResolverImpl implements ViewResolver {

    @Value('cell.mvc.defaultViewName')
    protected readonly defaultViewName: string;

    @Autowired(ViewProvider)
    protected readonly viewProvider: ViewProvider;

    async resolve(metadata: any, model: any): Promise<void> {
        const viewMetadata = <ViewMetadata>metadata.viewMetadata;
        viewMetadata.viewName = viewMetadata.viewName || this.defaultViewName;
        for (const view of this.viewProvider.provide()) {
            if (await view.support(viewMetadata)) {
                Context.getResponse().setHeader(HttpHeaders.CONTENT_TYPE, view.contentType);
                await view.render(model, viewMetadata);
                return;
            }
        }
        throw new Error('Not found a suitable view.');
    }
}
