import { Scheduler, Cron, CronExpression } from '@celljs/schedule';

@Scheduler()
export class SampleScheduler {
    
    @Cron(CronExpression.EVERY_5_SECONDS)
    schedule(): void {
        console.log('Every 5 seconds');
    }
}
