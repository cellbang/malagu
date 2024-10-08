import { ServiceA } from '@microservice/api';
import { Rpc } from '@celljs/rpc';

@Rpc(ServiceA)
export class WelcomeServerImpl implements ServiceA {
    say(): Promise<string> {
        return Promise.resolve('Service A');
    }
}
