import { container } from '@celljs/core/lib/common/container/dynamic-container';
import { Application } from '@celljs/core/lib/common/application/application-protocol';
import { ContainerProvider } from '@celljs/core/lib/common/container/container-provider';
import { FaaSEventListener } from '@celljs/faas-adapter/lib/node/event/event-protocol';

let listeners: FaaSEventListener<any, any>[];

async function start() {
    const c = await container;
    ContainerProvider.set(c);
    await c.get<Application>(Application).start();
    listeners = c.getAll<FaaSEventListener<any, any>>(FaaSEventListener);
}

const startPromise = start();

export async function handler(event: string, context: any, callback: any) {
    process.env.ALIBABA_ACCOUNT_ID = context.accountId;
    process.env.ALIBABA_ACCESS_KEY_ID = context.credentials?.accessKeyId;
    process.env.ALIBABA_ACCESS_KEY_SECRET = context.credentials?.accessKeySecret;
    process.env.ALIBABA_SECURITY_TOKEN = context.credentials?.securityToken;
    process.env.ALIBABA_REQUEST_ID = context.requestId;
    process.env.ALIBABA_REGION = context.region;
    try {
        await startPromise;
        let result = await Promise.all(listeners.map(l => l.onTrigger(event)));
        result = result.filter(item => !!item);
        callback(result.length === 1 ? result[0] : result);
    } catch (error) {
        callback(undefined, error);
    }

}
