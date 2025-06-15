// src/core/email/email.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { ApiConfigService } from '../../config/api-config.service';
import emailTemplates from './templates/email.templates';

@Injectable()
export class EmailService implements OnModuleInit {
    private transporter: nodemailer.Transporter;
    private appName: string;
    private logo: Buffer;

    constructor(private readonly configService: ApiConfigService) {}

    async onModuleInit() {
        this.appName = this.configService.get('app.name');

        // Ініціалізуємо логотип
        const logoPath = this.configService.get('assets.paths.logos');
        const logoFilename = this.configService.get('assets.filenames.logo');
        const fullLogoPath = path.resolve(logoPath, logoFilename);

        try {
            this.logo = fs.readFileSync(fullLogoPath);
        } catch (error) {
            console.error(`Failed to read logo file at: ${fullLogoPath}`, error);
            throw error; // Зупиняємо ініціалізацію, якщо логотип не знайдено
        }

        // Створюємо та верифікуємо транспортер
        this.transporter = this.createTransport();
        try {
            await this.transporter.verify();
            console.log('Nodemailer transporter is ready to send emails.');
        } catch (error) {
            console.error('Error verifying Nodemailer transporter:', error);
            throw error;
        }
    }

    private createTransport(): nodemailer.Transporter {
        if (this.configService.get('google.useGmail')) {
            const senderEmail = this.configService.get('google.gmailApi.senderEmail');
            const authConfig = this.configService.get('google.gmailApi.useServiceAccount')
                ? this.getServiceAccountAuth(senderEmail)
                : this.getOAuth2Auth(senderEmail);

            return nodemailer.createTransport({ service: 'gmail', auth: authConfig });
        }

        console.log('Using Ethereal for email transport.');
        return nodemailer.createTransport({
            host: this.configService.get('ethereal.host'),
            port: this.configService.get('ethereal.port'),
            auth: {
                user: this.configService.get('ethereal.user'),
                pass: this.configService.get('ethereal.password'),
            },
        });
    }

    private getServiceAccountAuth(user: string) {
        const keyFilePath = this.configService.get('google.gmailApi.serviceAccountKey');
        const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');
        const credentials = JSON.parse(keyFileContent);

        return {
            type: 'OAuth2',
            user,
            serviceClient: credentials.client_id,
            privateKey: credentials.private_key,
        };
    }

    private getOAuth2Auth(user: string) {
        return {
            type: 'OAuth2',
            user,
            clientId: this.configService.get('google.gmailApi.clientId'),
            clientSecret: this.configService.get('google.gmailApi.clientSecret'),
            refreshToken: this.configService.get('google.gmailApi.refreshToken'),
        };
    }

    private async sendEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: `"${this.appName}" <${this.configService.get('google.gmailApi.senderEmail')}>`,
                to,
                subject,
                html,
                attachments: [
                    {
                        filename: this.configService.get('assets.filenames.logo'),
                        content: this.logo,
                        cid: 'logo@project', // Content-ID для використання в HTML
                    },
                ],
            });
            console.log(`Email sent successfully to ${to}: ${info.messageId}`);
        } catch (error) {
            console.error(`Failed to send email to ${to}`, error);
        }
    }

    async sendConfirmationEmail(to: string, confirmationLink: string, fullName: string): Promise<void> {
        const subject = `[Action Required] Confirm Your Email for ${this.appName}`;
        const html = emailTemplates.getConfirmationEmailTemplate(
            confirmationLink,
            this.appName,
            fullName,
        );
        await this.sendEmail(to, subject, html);
    }

    async sendResetPasswordEmail(to: string, resetLink: string, fullName: string): Promise<void> {
        const subject = `[Action Required] Reset Your ${this.appName} Password`;
        const html = emailTemplates.getResetPasswordEmailTemplate(
            resetLink,
            this.appName,
            fullName,
        );
        await this.sendEmail(to, subject, html);
    }

    // Оновлений метод, що відповідає інтерфейсу
    async sendWelcomeEmail(to: string, redirectLink: string, fullName: string): Promise<void> {
        const subject = `Welcome to ${this.appName}! Your Canvas Awaits 🎉`;
        const html = emailTemplates.getWelcomeEmailTemplate(
            fullName,
            redirectLink,
            this.appName,
        );
        await this.sendEmail(to, subject, html);
    }
}
