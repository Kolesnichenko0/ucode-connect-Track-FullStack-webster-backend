// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ApiConfigService } from './config/api-config.service';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { CsrfExceptionFilter } from './common/filters';
import { CsrfError } from './common/filters';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { applySwaggerSecurity } from './common/enhancers';
import * as path from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(cookieParser());

    const cs = app.get(ApiConfigService);
    const globalPrefix = cs.get('app.globalPrefix');
    const serverPort = cs.get('app.serverPort');
    const serverBaseUrl = cs.get('app.serverUrl');
    const frontendOrigin = cs.get('app.clientUrl');
    const csrfConfig = cs.get('app.csrf');
    const corsConfig = cs.get('app.cors');
    const publicAssetsPath = cs.get('assets.public.paths.base');
    const projectPath = cs.get('assets.public.paths.logos');
    const logoFilename = cs.get('assets.filenames.logo');
    console.log(`${publicAssetsPath}`);
    console.log(`${projectPath}`);
    console.log(`${logoFilename}`);
    console.log(cs.get('assets'));
    console.log(cs.get('storage'));
    const fullLogoPath = path.join(projectPath, logoFilename);

    app.useGlobalFilters(new CsrfExceptionFilter());
    app.setGlobalPrefix(globalPrefix);
    app.useStaticAssets(publicAssetsPath);

    app.enableCors({
        origin: frontendOrigin,
        methods: corsConfig.methods,
        allowedHeaders: corsConfig.allowedHeaders,
        credentials: corsConfig.credentials, // Required to send cookies cross-origin
    });

    app.use(
        csurf({
            cookie: {
                key: csrfConfig.cookie.key,
                httpOnly: csrfConfig.cookie.httpOnly, //Not available via JS
                secure: csrfConfig.cookie.secure, //Cookies are only transmitted via HTTPS
                sameSite: csrfConfig.cookie.sameSite, //Cookies will only be sent for requests originating from the same domain (site)
            },
            ignoreMethods: csrfConfig.ignoreMethods,
        }),
    );

    app.use((err: any, req: any, res: any, next: any) => {
        if (err && err.code === 'EBADCSRFTOKEN') {
            next(new CsrfError());
        } else {
            next(err);
        }
    });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true, // Automatically convert incoming primitive values into instances of classes specified in the DTO
            transformOptions: {
                enableImplicitConversion: true, // Enable implicit type conversion
                exposeDefaultValues: true, // Expose default values in the transformed object
            },
            whitelist: true, // Filters out properties that do not have decorators
            forbidNonWhitelisted: false, // Does not generate an error if there are extra fields
            validateCustomDecorators: true, // Validate custom decorators
        }),
    );

    const configAPIDoc = new DocumentBuilder()
        .setTitle('uevent API')
        .setDescription('The uevent API documentation')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                description: 'Enter JWT access token',
                in: 'header',
            },
            'access-token',
        )
        .addApiKey(
            {
                type: 'apiKey',
                name: 'X-CSRF-TOKEN',
                in: 'header',
            },
            'csrf-token',
        )
        .build();

    const document = SwaggerModule.createDocument(app, configAPIDoc);

    applySwaggerSecurity(app, document, globalPrefix);

    SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
            ...(cs.isProduction() && { docExpansion: 'none' }),
            filter: true,
            withTryItOutOption: true, // whether to display the button at all
            tryItOutEnabled: false, // whether to activate the test mode automatically
            displayRequestDuration: true,
        },
        customSiteTitle: 'Uevent API',
        customfavIcon: `${fullLogoPath}`,
    });

    app.use(
        '/',
        (
            req: { originalUrl: string },
            res: { redirect: (arg0: string) => any },
            next: () => void,
        ) => {
            if (req.originalUrl === '/' || req.originalUrl === '') {
                return res.redirect(`/${globalPrefix}`);
            }
            next();
        },
    );

    await app.listen(serverPort);

    console.log(`\n✔ Application is running on: ${serverBaseUrl}`);
    console.log(`\n✔ API Docs is available on: ${serverBaseUrl}/${globalPrefix}\n`);
}

bootstrap();
