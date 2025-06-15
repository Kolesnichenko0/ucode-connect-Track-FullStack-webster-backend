// src/core/email/templates/email.templates.ts
import { EmailTemplateInterface } from './email-template.interface';

// Палітра, що відповідає стилю вашого сервісу
const colors = {
    primary: '#3B82F6', // Основний синій
    secondary: '#93C5FD', // Світліший синій
    background: '#F8F9FA', // Дуже світлий фон
    text: '#1F2937', // Темний текст
    textSecondary: '#4B5563', // Сірий текст
    buttonText: '#FFFFFF', // Білий текст
    border: '#E5E7EB', // Світло-сіра рамка
};

export default {
    getConfirmationEmailTemplate: (
        confirmationLink: string,
        projectName: string,
        fullName: string,
    ) => `
<div style="margin:0; padding:0; background-color:${colors.background}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:30px; border:1px solid ${colors.border}; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05)">
    <div style="text-align:center; margin-bottom:30px;">
      <img src="cid:logo@project" alt="${projectName} Logo" style="max-width:140px;">
    </div>
    <div style="text-align:center; margin-bottom:25px; border-bottom:1px solid ${colors.border}; padding-bottom:20px;">
      <h2 style="color:${colors.text}; font-size:26px; font-weight:600;">
        Confirm Your Email for ${projectName}
      </h2>
    </div>
    <div style="font-size:16px; color:${colors.textSecondary}; line-height:1.7;">
      <p style="margin-bottom:20px;">Hello <strong>${fullName}</strong>! 👋</p>
      <p style="margin-bottom:25px;">We're excited for you to start your creative journey with ${projectName}. Please click the button below to verify your email address and activate your account.</p>
      <div style="text-align:center; margin:35px 0;">
        <a href="${confirmationLink}" target="_blank"
          style="background-color:${colors.primary}; color:${colors.buttonText}; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:600; display:inline-block; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
          Verify My Email
        </a>
      </div>
      <p style="margin-bottom:10px; color:${colors.textSecondary}; font-size:14px;">This confirmation link will expire in 7 days.</p>
      <p style="margin-bottom:10px; color:${colors.textSecondary}; font-size:14px;">If you did not create this account, you can safely ignore this email.</p>
      <div style="margin-top:40px; padding-top:20px; border-top:1px solid ${colors.border}; text-align:center; font-size:13px; color:#9CA3AF;">
        <p>© ${new Date().getFullYear()} <a href="#" style="color:${colors.primary}; text-decoration:none;">${projectName}</a>. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>
`,

    getResetPasswordEmailTemplate: (
        resetLink: string,
        projectName: string,
        fullName: string,
    ) => `
<div style="margin:0; padding:0; background-color:${colors.background}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:30px; border:1px solid ${colors.border}; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05)">
    <div style="text-align:center; margin-bottom:30px;">
      <img src="cid:logo@project" alt="${projectName} Logo" style="max-width:140px;">
    </div>
    <div style="text-align:center; margin-bottom:25px; border-bottom:1px solid ${colors.border}; padding-bottom:20px;">
      <h2 style="color:${colors.text}; font-size:26px; font-weight:600;">
        Reset Your ${projectName} Password
      </h2>
    </div>
    <div style="font-size:16px; color:${colors.textSecondary}; line-height:1.7;">
      <p style="margin-bottom:20px;">Hello <strong>${fullName}</strong>! 👋</p>
      <p style="margin-bottom:25px;">We received a request to reset the password for your account. To create a new password, please click the button below:</p>
      <div style="text-align:center; margin:35px 0;">
        <a href="${resetLink}" target="_blank"
          style="background-color:${colors.primary}; color:${colors.buttonText}; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:600; display:inline-block; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
          Reset My Password
        </a>
      </div>
      <p style="margin-bottom:10px; color:${colors.textSecondary}; font-size:14px;">This reset link will expire in 24 hours.</p>
      <p style="margin-bottom:10px; color:${colors.textSecondary}; font-size:14px;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      <div style="margin-top:40px; padding-top:20px; border-top:1px solid ${colors.border}; text-align:center; font-size:13px; color:#9CA3AF;">
        <p>© ${new Date().getFullYear()} <a href="#" style="color:${colors.primary}; text-decoration:none;">${projectName}</a>. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>
`,

    // Я уніфікував назву змінної до `projectName` для послідовності
    getWelcomeEmailTemplate: (
        fullName: string,
        redirectLink: string,
        projectName: string,
    ) => `
<div style="margin:0; padding:0; background-color:${colors.background}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:30px; border:1px solid ${colors.border}; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05)">
    <div style="text-align:center; margin-bottom:30px;">
      <img src="cid:logo@project" alt="${projectName} Logo" style="max-width:140px;">
    </div>
    <div style="text-align:center; margin-bottom:25px; border-bottom:1px solid ${colors.border}; padding-bottom:20px;">
      <h2 style="color:${colors.text}; font-size:26px; font-weight:600;">
        Your Canvas Awaits, ${fullName}!
      </h2>
    </div>
    <div style="font-size:16px; color:${colors.textSecondary}; line-height:1.7;">
      <p style="margin-bottom:20px;">Welcome to <strong>${projectName}</strong>! We are thrilled to have you on board. 🎨</p>
      <p style="margin-bottom:25px;">You're now ready to unleash your creativity. With a wide selection of templates, fonts, and powerful image processing features, you can easily create impressive images and designs.</p>

      <div style="background-color:${colors.background}; border-radius:8px; padding:20px; margin:25px 0; text-align:left;">
        <h3 style="color:${colors.text}; margin-top:0; font-size:18px; font-weight:600;">What's next?</h3>
        <ul style="padding-left:20px; margin-bottom:0; list-style-type: '✓ '; color:${colors.primary};">
          <li style="margin-bottom:10px; padding-left:8px;"><span style="color:${colors.textSecondary};">Explore our library of professional templates.</span></li>
          <li style="margin-bottom:10px; padding-left:8px;"><span style="color:${colors.textSecondary};">Upload your own images and apply unique filters.</span></li>
          <li style="padding-left:8px;"><span style="color:${colors.textSecondary};">Share your creations with the world!</span></li>
        </ul>
      </div>

      <div style="text-align:center; margin:35px 0;">
        <a href="${redirectLink}" target="_blank"
          style="background-color:${colors.primary}; color:${colors.buttonText}; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:600; display:inline-block; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
          Start Creating Now
        </a>
      </div>

      <p style="margin-bottom:20px;">If you have any questions, feel free to reach out to our support team.</p>
      <p style="margin-bottom:5px;">Happy designing!</p>
      <p style="margin-bottom:20px; font-weight:600; color:${colors.text};">The ${projectName} Team</p>

      <div style="margin-top:40px; padding-top:20px; border-top:1px solid ${colors.border}; text-align:center; font-size:13px; color:#9CA3AF;">
        <p>© ${new Date().getFullYear()} <a href="#" style="color:${colors.primary}; text-decoration:none;">${projectName}</a>. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>
`,
} as EmailTemplateInterface;
