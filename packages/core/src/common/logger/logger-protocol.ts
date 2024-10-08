export const LOGGER_CONFIG = 'cell.logger';
export const LOGGER_LEVEL = `${LOGGER_CONFIG}.level`;

export const Logger = Symbol('Logger');
export const TraceIdProvider = Symbol('TraceIdProvider');

export type LogLevel = 'verbose' | 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
    /*
     * Set the context information of the log object level. When printing the log, the context will be carried.
     * If the context of the log method level is additionally specified when printing the log, the occlusion overrides the context of the log object level
     */
    setContext(context?: string): void;
    info(message: any, context?: string): void;
    error(message: any, context?: string): void;
    warn(message: any, context?: string): void;
    debug(message: any, context?: string): void;
}

export interface TraceIdProvider {
    provide(): string | undefined;
}
