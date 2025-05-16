// src/core/jwt/factories/jwt-guard.factory.ts
import { AuthGuard } from '@nestjs/passport';
import { Type, Injectable } from '@nestjs/common';

export function createJwtGuard(strategy: string): Type<any> {
    @Injectable()
    class JwtGuardClass extends AuthGuard(strategy) { }

    Object.defineProperty(JwtGuardClass, 'name', {
        value: `Jwt${strategy.charAt(0).toUpperCase() + strategy.slice(1)}Guard`,
    });

    return JwtGuardClass;
}
