import { UserChecker } from './user-protocol';
import { Component, Autowired, Logger } from '@celljs/core';
import { LockedError, AccountExpiredError, DisabledError, CredentialsExpiredError } from '../error';
import { User } from '../../common';

@Component(UserChecker)
export class UserCheckerImpl implements UserChecker {
    @Autowired(Logger)
    protected readonly logger: Logger;

    async check(user: User): Promise<void> {
        if (!user.accountNonLocked) {
            this.logger.info('User account is locked');

            throw new LockedError('User account is locked');
        }

        if (!user.enabled) {
            this.logger.info('User account is disabled');

            throw new DisabledError('User is disabled');
        }

        if (!user.accountNonExpired) {
            this.logger.info('User account is expired');

            throw new AccountExpiredError('User account has expired');
        }

        if (!user.credentialsNonExpired) {
            this.logger.info('User account is expired');

            throw new CredentialsExpiredError('User credentials have expired');
        }
    }

}
