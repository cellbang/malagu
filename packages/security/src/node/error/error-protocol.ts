import { HTTP_ERROR_HANDLER_PRIORITY } from '@celljs/web/lib/node';

export const ACCESS_DENIED_ERROR_HANDLER_PRIORITY = HTTP_ERROR_HANDLER_PRIORITY + 100;

export const AUTHENTICATION_ERROR_HANDLER_PRIORITY = ACCESS_DENIED_ERROR_HANDLER_PRIORITY + 100;
