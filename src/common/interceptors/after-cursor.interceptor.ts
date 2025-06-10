// src/user/interceptor/after-cursor.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as qs from 'qs';

@Injectable()
export class AfterCursorQueryParseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const originalUrl = request.originalUrl ?? '';
    const queryString = originalUrl.split('?')[1] || '';

    if (queryString) {
      try {
        const parsedQuery = qs.parse(queryString);
        Object.defineProperty(request, 'query', {
          value: parsedQuery,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } catch (error) {
        console.error('QueryParseInterceptor error:', error);
      }
    }

    return next.handle();
  }
}
