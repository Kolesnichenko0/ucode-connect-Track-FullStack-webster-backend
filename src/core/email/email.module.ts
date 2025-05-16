// src/core/email/email.module.ts
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { GoogleModule } from '../google/google.module';

@Module({
    imports: [
        GoogleModule,
    ],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule { }
