// src/common/enhancers/swagger-security.enhancer.ts
import { INestApplication, RequestMethod } from '@nestjs/common';
import { ApiConfigService } from '../../config/api-config.service';
import { ModulesContainer } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

function normalizePath(path: string): string {
    let result = path.replace(/\/+/g, '/');
    if (result !== '/' && result.endsWith('/')) {
        result = result.slice(0, -1);
    }
    return result;
}

export function applySwaggerSecurity(
    app: INestApplication,
    document: any,
    globalPrefix: string
): void {
    const cs = app.get(ApiConfigService);
    const csrfConfig = cs.get('app.csrf');
    const ignoreMethods = csrfConfig.ignoreMethods;
    const ignoreMethodsLower = ignoreMethods.map((method: string) =>
        method.toLowerCase()
    );

    const modulesContainer = app.get(ModulesContainer);
    const jwtProtectedPaths = new Map<string, string[]>();

    const jwtProtectedRoutes = new Set<string>();

    for (const [, module] of modulesContainer.entries()) {
        const controllers = module.controllers;
        for (const [, controller] of controllers.entries()) {
            if (!controller.metatype) continue;
            const controllerInstance = controller.instance;
            if (!controllerInstance) continue;

            const basePath =
                Reflect.getMetadata('path', controller.metatype) || '';

            const prototype = Object.getPrototypeOf(controllerInstance);
            const methodNames = Object.getOwnPropertyNames(prototype).filter(
                (prop) =>
                    prop !== 'constructor' && typeof prototype[prop] === 'function'
            );

            for (const methodName of methodNames) {
                const methodHandler = prototype[methodName];
                
                const isPublic =
                    Reflect.getMetadata(IS_PUBLIC_KEY, methodHandler) === true;

                const isProtected = !isPublic;

                if (isProtected) {
                    const methodPath =
                        Reflect.getMetadata('path', methodHandler) || '';
                    const httpMethod = Reflect.getMetadata('method', methodHandler);
                    if (httpMethod !== undefined && methodPath !== undefined) {
                        let methodStr = '';
                        if (typeof httpMethod === 'string') {
                            methodStr = httpMethod;
                        } else if (typeof httpMethod === 'number') {
                            methodStr = RequestMethod[httpMethod];
                        }
                        const computedPath = `/${globalPrefix}/${basePath}/${methodPath}`;
                        const fullPath = normalizePath(computedPath);

                        jwtProtectedRoutes.add(fullPath);

                        if (!jwtProtectedPaths.has(fullPath)) {
                            jwtProtectedPaths.set(fullPath, []);
                        }
                        jwtProtectedPaths
                            .get(fullPath)
                            ?.push(methodStr.toLowerCase());
                    }
                }
            }
        }
    }

    Object.keys(document.paths).forEach((path) => {
        const normalizedSwaggerPath = normalizePath(path).replace(
            /{([^}]+)}/g,
            ':$1'
        );

        let isJwtProtectedRoute = jwtProtectedRoutes.has(normalizedSwaggerPath);

        if (!isJwtProtectedRoute) {
            for (const protectedPath of jwtProtectedRoutes) {
                try {
                    const escapedPath = protectedPath
                        .replace(/\//g, '\\/')
                        .replace(/:\w+/g, '[^/]+');
                    const pathRegex = new RegExp('^' + escapedPath + '$');
                    if (pathRegex.test(normalizedSwaggerPath)) {
                        isJwtProtectedRoute = true;
                        break;
                    }
                } catch (e) {
                    console.error(
                        `Error in path regex for ${protectedPath}:`,
                        e
                    );
                }
            }
        }

        Object.keys(document.paths[path]).forEach((method) => {
            if (!document.paths[path][method].security) {
                document.paths[path][method].security = [];
            }
            const originalSecArr = document.paths[path][method].security;

            const isIgnoreMethod = ignoreMethodsLower.includes(
                method.toLowerCase()
            );

            let isJwtProtectedMethod = false;
            if (
                jwtProtectedPaths.has(normalizedSwaggerPath) &&
                jwtProtectedPaths.get(normalizedSwaggerPath)?.includes(
                    method.toLowerCase()
                )
            ) {
                isJwtProtectedMethod = true;
            } else {
                for (const [protectedPath, methods] of jwtProtectedPaths.entries()) {
                    try {
                        const escapedPath = protectedPath
                            .replace(/\//g, '\\/')
                            .replace(/:\w+/g, '[^/]+');
                        const pathRegex = new RegExp('^' + escapedPath + '$');
                        if (
                            pathRegex.test(normalizedSwaggerPath) &&
                            methods.includes(method.toLowerCase())
                        ) {
                            isJwtProtectedMethod = true;
                            break;
                        }
                    } catch (e) {
                        console.error(
                            `Error in path regex for ${protectedPath}:`,
                            e
                        );
                    }
                }
            }

            let newSecurity = originalSecArr.map((secObj: any) => ({
                ...secObj,
            }));

            if (isIgnoreMethod) {
                newSecurity = newSecurity.map((secObj: any) => {
                    if (secObj['csrf-token'] !== undefined) {
                        delete secObj['csrf-token'];
                    }
                    return secObj;
                });
                if (!isJwtProtectedMethod) {
                    newSecurity = newSecurity.filter(
                        (secObj: any) => Object.keys(secObj).length > 0
                    );
                }
            } else {
                const hasCsrf = newSecurity.some(
                    (secObj: any) => secObj['csrf-token'] !== undefined
                );
                if (!hasCsrf) {
                    newSecurity.push({ 'csrf-token': [] });
                }
            }

            const shouldAddJwtSecurity = method.toLowerCase() === 'get'
                ? isJwtProtectedRoute
                : isJwtProtectedMethod;

            if (shouldAddJwtSecurity) {
                const hasJwt = newSecurity.some(
                    (secObj: any) => secObj['access-token'] !== undefined
                );
                if (!hasJwt) {
                    newSecurity.push({ 'access-token': [] });
                }

                const hasJWT = newSecurity.some(
                    (secObj: any) => secObj['JWT'] !== undefined
                );
                if (!hasJWT) {
                    newSecurity.push({ 'JWT': [] });
                }
            }

            document.paths[path][method].security = newSecurity;
        });
    });
}
