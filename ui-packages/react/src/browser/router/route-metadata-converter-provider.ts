import { Component, Autowired, Prioritizeable, Optional } from '@celljs/core';
import { RouteMetadataConverterProvider, RouteMetadataConverter } from './router-protocol';

@Component(RouteMetadataConverterProvider)
export class RouteMetadataConverterProviderImpl implements RouteMetadataConverterProvider {

    protected prioritized: RouteMetadataConverter[];

    @Autowired(RouteMetadataConverter) @Optional()
    protected readonly routeMetadataConverters: RouteMetadataConverter[] = [];

    provide(): RouteMetadataConverter[] {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.routeMetadataConverters).map(c => c.value);
        }
        return this.prioritized;
    }

}
