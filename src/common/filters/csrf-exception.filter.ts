// src/common/filters/csrf-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

export class CsrfError extends Error {
    code: string;

    constructor() {
        super('CSRF token mismatch');
        this.code = 'EBADCSRFTOKEN';
    }
}

@Catch(CsrfError)
export class CsrfExceptionFilter implements ExceptionFilter {
    catch(exception: CsrfError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        return response.status(HttpStatus.FORBIDDEN).json({
            statusCode: HttpStatus.FORBIDDEN,
            message: 'Invalid CSRF token',
            path: request.url,
        });
    }
}
