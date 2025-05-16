// src/core/email/templates/email-template.interface.ts
export interface EmailTemplateInterface {
    getConfirmationEmailTemplate: (
        confirmationLink: string,
        projectName: string,
        fullName: string,
    ) => string;

    getResetPasswordEmailTemplate: (
        resetLink: string,
        projectName: string,
        fullName: string,
    ) => string;

    getWelcomeCompanyEmailTemplate: (
        companyOwnerName: string,
        companyTitle: string,
        redirectLink: string,
        serviceName: string,
    ) => string;
}
