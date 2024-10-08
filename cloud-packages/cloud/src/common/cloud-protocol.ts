import { Autowired, ConfigUtil } from '@celljs/core';
import { Account, AccountProvider } from './account-protocol';
import { ClientOptions, ClientOptionsProvider } from './client-protocol';
import { Credentials, CredentialsProvider } from './credentials-protocol';
import { RegionProvider } from './region-protocol';

export interface CloudService<T extends RawCloudService> {
    name: string;
    getRawCloudService(): Promise<T>;
    setRawCloudService(innerService: T): void;
}

export interface RawCloudService {

}

export abstract class AbstractCloudService<T extends RawCloudService> implements CloudService<T> {

    name: string;

    @Autowired(RegionProvider)
    protected readonly regionProvider: RegionProvider;

    @Autowired(CredentialsProvider)
    protected readonly credentialsProvider: CredentialsProvider;

    @Autowired(AccountProvider)
    protected readonly accountProvider: AccountProvider;

    @Autowired(ClientOptionsProvider)
    protected readonly clientOptionsProvider: ClientOptionsProvider;

    protected _rawCloudService: T;

    async getRawCloudService(): Promise<T> {
        if (!this._rawCloudService) {
            const accountProp = `cell.cloud.${this.name}.account`;
            const clientProp = `cell.cloud.${this.name}.client`;
            const regionProp = `cell.cloud.${this.name}.region`;
            const credentialsProp = `cell.cloud.${this.name}.credentials`;

            const account = ConfigUtil.get<Account>(accountProp) || await this.accountProvider.provide();
            const clientOptions = ConfigUtil.get<ClientOptions>(clientProp) || await this.clientOptionsProvider.provide() || { internal: true };
            const region = ConfigUtil.get<string>(regionProp) || await this.regionProvider.provide();
            if (!region) {
                throw Error(`Please configure region through the properties "cell.cloud.region" or "${regionProp}"`);
            }
            const credentials = ConfigUtil.get<Credentials>(credentialsProp) || await this.credentialsProvider.provide();
            if (!credentials) {
                throw Error(`Please configure credentials through the properties "cell.cloud.credentials" or "${credentialsProp}"`);
            }

            this._rawCloudService = await this.doCreateRawCloudService(credentials, region, clientOptions, account);
        }
        return this._rawCloudService;
    }

    setRawCloudService(rawCloudService: T): void {
        this._rawCloudService = rawCloudService;
    }

    protected abstract doCreateRawCloudService(credentials: Credentials, region: string, clientOptions: ClientOptions, account?: Account): Promise<T>;

}
