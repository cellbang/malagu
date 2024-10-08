import { Prioritizeable, Component, Autowired } from '@celljs/core';
import { ErrorConverter } from '../converter';
import { JsonRpcProxy } from '../factory';
import { ProxyProvider, ProxyCreator } from './proxy-protocol';

@Component(ProxyProvider)
export class ProxyProviderImpl implements ProxyProvider {

    constructor(
        @Autowired(ProxyCreator)
        protected readonly proxyCreators: ProxyCreator[]
    ) { }

    provide<T extends object>(path: string, errorConverters?: ErrorConverter[], target?: object): JsonRpcProxy<T>  {
        return this.prioritize(path)[0].create(path, errorConverters, target);
    }

    protected prioritize(path: string): ProxyCreator[] {
        const prioritized = Prioritizeable.prioritizeAllSync(this.proxyCreators, proxyCreator => {
            try {
                return proxyCreator.support(path);
            } catch {
                return 0;
            }
        });
        return prioritized.map(p => p.value);
    }

}
