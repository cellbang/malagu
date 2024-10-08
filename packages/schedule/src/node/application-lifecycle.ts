import { CronMetadata, SCHEDULER, SchedulerMetadata } from './annotation';
import { METADATA_KEY } from './constants';
import { Component, Value, Autowired, Optional, ApplicationLifecycle, getTargetClass, getOwnMetadata, Logger, generateUUUID } from '@celljs/core';

import { BackendApplication } from '@celljs/core/lib/node';
import { SchedulerRegistry } from './registry';

@Component(ApplicationLifecycle)
export class ApplicationLifecycleImpl implements ApplicationLifecycle<BackendApplication> {

    @Autowired(SCHEDULER) @Optional()
    protected readonly shedulers: any[] = [];

    @Value('cell.schedule.disabled')
    protected readonly scheduleDisabled = false;

    @Autowired(SchedulerRegistry)
    protected readonly schedulerRegistry: SchedulerRegistry;

    @Autowired(Logger)
    protected readonly logger: Logger;

    initialize(): void {
        if (this.scheduleDisabled) {
            return;
        }
        for (const scheduler of this.shedulers) {
            const targetConstructor = getTargetClass(scheduler);
            const schedulerMetadata = <SchedulerMetadata>Reflect.getOwnMetadata(METADATA_KEY.scheduler, targetConstructor);
            const cronMetadatas = <CronMetadata[]>getOwnMetadata(METADATA_KEY.cron, targetConstructor);
            for (const cronMetadata of cronMetadatas) {
                const name = cronMetadata.name || generateUUUID();
                const method = cronMetadata.method;
                this.schedulerRegistry.add(name, {
                    ...schedulerMetadata,
                    ...cronMetadata,
                    onTick: async () => {
                        try {
                            await scheduler[method]();
                        } catch (error) {
                            this.logger.error(error);
                        }
                    }
                }).start();
            }

        }
    }

    onStop() {
        for (const [ name ] of this.schedulerRegistry.getAll()) {
            this.schedulerRegistry.delete(name);
        }
    }

}
