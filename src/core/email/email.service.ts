// src/core/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ApiConfigService } from '../../config/api-config.service';
import { GoogleOAuthService } from '../google/google-oauth.service';
import * as fs from 'fs';
import * as path from 'path';
import { EmailTemplateInterface } from './templates/email-template.interface';
import emailTemplates from './templates/email.templates';


@Injectable()
export class EmailService {
    private appName: string;
    private logo: any;
    private templates: EmailTemplateInterface;

    constructor(
        private readonly cs: ApiConfigService,
        private readonly googleOAuthService: GoogleOAuthService,
    ) {
        if (this.cs.get('google.useGmail')) {
            this.googleOAuthService.setCredentials(
                this.cs.get('google.gmailApi.refreshToken'),
            );
        }
        this.templates = emailTemplates;

        this.init();
    }

    private async init() {
        const projectPath = this.cs.get('app.paths.publicAssets.logos');
        const logoFilename = this.cs.get('app.logo.filename');

        const fullLogoPath = path.join(projectPath, logoFilename);
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
            const accessToken = await this.googleOAuthService.getAccessToken();
            const oauthDetails = this.googleOAuthService.getOAuthCredentials();

            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: this.cs.get('google.gmailApi.user'),
                    clientId: oauthDetails.clientId,
                    clientSecret: oauthDetails.clientSecret,
                    refreshToken: oauthDetails.refreshToken,
                    redirectUri: oauthDetails.redirectUri,
                    accessToken,
                },
            });
        } else {
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

    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            const transporter = await this.createTransport();

            const info = await transporter.sendMail({
                from: this.cs.get('google.gmailApi.user'),
                to,
                subject,
                html,
                attachments: [
                    {
                        filename: this.cs.get('app.paths.publicAssets.logos'),
                        content: this.logo,
                        cid: 'logo@project',
                    },
                ],
            });
            console.log(`Email sent successfully: ${info.messageId}`);
        } catch (error) {
            console.error(`Failed to send email to ${to}`, error);
            throw error;
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

    async sendWelcomeCompanyEmail(
        to: string,
        companyOwnerName: string,
        companyTitle: string,
        redirectLink: string,
    ): Promise<void> {
        const html = this.templates.getWelcomeCompanyEmailTemplate(
            companyOwnerName,
            companyTitle,
            redirectLink,
            this.appName,
        );
        await this.sendEmail(
            to,
            `Welcome to ${this.appName} – Start Selling Tickets Today! 🎉`,
            html,
        );
    }
}
