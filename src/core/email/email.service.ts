// src/core/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ApiConfigService } from '../../config/api-config.service';
import * as fs from 'fs';
import * as path from 'path';
import { EmailTemplateInterface } from './templates/email-template.interface';
import emailTemplates from './templates/email.templates';


@Injectable()
export class EmailService {
    private appName: string;
    private logo: any;
    private templates: EmailTemplateInterface;
    private transporter: nodemailer.Transporter;

    constructor(
        private readonly cs: ApiConfigService,
    ) {
        this.templates = emailTemplates;
    }

    async onModuleInit() {
        await this.initLogo();
        this.transporter = await this.createTransport();
        await this.verifyTransporter();
    }

    private async initLogo() {
        const projectPath = this.cs.get('assets.paths.logos');
        const logoFilename = this.cs.get('assets.filenames.logo');

        const fullLogoPath = path.join(projectPath, logoFilename);
        this.appName = this.cs.get('app.name');
        this.logo = await this.readLogoFile(fullLogoPath);
    }

    private async readLogoFile(filePath: string): Promise<Buffer> {
        return fs.readFileSync(path.resolve(filePath));
    }

    private async readHtmlFile(filePath: string): Promise<string> {
        return fs.readFileSync(path.resolve(filePath), 'utf-8');
    }

    private async createTransport() {
        const useGmail = this.cs.get('google.useGmail');

        if (useGmail) {
            const senderEmail = this.cs.get('google.gmailApi.senderEmail');
            if (this.cs.get('google.gmailApi.useServiceAccount')) {
                const keyFilePath = this.cs.get('google.gmailApi.serviceAccountKey');

                let serviceAccountCredentials;
                try {
                    const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');
                    serviceAccountCredentials = JSON.parse(keyFileContent);
                } catch (error) {
                    console.error('Failed to read or parse service account key file:', error);
                    throw error;
                }

                if (!serviceAccountCredentials.client_id || !serviceAccountCredentials.private_key) {
                    const errorMessage = 'Service account key file is missing client_id or private_key.';
                    console.error(errorMessage, serviceAccountCredentials);
                    throw new Error(errorMessage);
                }


                return nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: senderEmail,
                        serviceClient: serviceAccountCredentials.client_id,
                        privateKey: serviceAccountCredentials.private_key,
                    },
                });
            } else {
                console.log('Using Gmail with OAuth2 (client ID, client secret, refresh token).');
                return nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: senderEmail,
                        clientId: this.cs.get('google.gmailApi.clientId'),
                        clientSecret: this.cs.get('google.gmailApi.clientSecret'),
                        refreshToken: this.cs.get('google.gmailApi.refreshToken'),
                    },
                });
            }
        } else {
            console.log('Using Ethereal');
            return nodemailer.createTransport({
                host: this.cs.get('ethereal.host'),
                port: this.cs.get('ethereal.port'),
                auth: {
                    user: this.cs.get('ethereal.user'),
                    pass: this.cs.get('ethereal.password'),
                },
            });
        }
    }

    private async verifyTransporter() {
        try {
            await this.transporter.verify();
            console.log('Nodemailer transporter is ready to send emails.');
        } catch (error) {
            console.error('Error verifying Nodemailer transporter:', error);
            throw error;
        }
    }

    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: this.cs.get('google.gmailApi.senderEmail'),
                to,
                subject,
                html,
                attachments: [
                    {
                        filename: this.cs.get('assets.paths.logos'),
                        content: this.logo,
                        cid: 'logo@project',
                    },
                ],
            });
            console.log(`Email sent successfully: ${info.messageId}`);
        } catch (error) {
            console.error(`Failed to send email to ${to}`, error);
        }
    }

    async sendConfirmationEmail(
        to: string,
        confirmationLink: string,
        fullName: string,
    ): Promise<void> {
        const html = this.templates.getConfirmationEmailTemplate(
            confirmationLink,
            this.appName,
            fullName
        );
        await this.sendEmail(
            to,
            `[Action Required] Confirm Email | ${this.appName}`,
            html,
        );
    }

    async sendResetPasswordEmail(to: string, resetLink: string, fullName: string): Promise<void> {
        const html = this.templates.getResetPasswordEmailTemplate(resetLink, this.appName, fullName);
        await this.sendEmail(
            to,
            `[Action Required] Password Reset | ${this.appName}`,
            html,
        );
    }
}
