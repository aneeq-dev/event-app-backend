import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, code: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #6C63FF; /* Adjust to match app theme */
            padding: 24px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 32px 24px;
            text-align: center;
          }
          .content p {
            color: #555555;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .code-container {
            margin: 24px 0;
          }
          .code {
            display: inline-block;
            background-color: #f0f0f7;
            color: #333333;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 4px;
            padding: 16px 32px;
            border-radius: 8px;
            border: 1px dashed #6C63FF;
          }
          .footer {
            background-color: #f9f9f9;
            padding: 16px;
            text-align: center;
            font-size: 12px;
            color: #999999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to EventApp!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for signing up. To complete your registration, please verify your email address by entering the code below:</p>
            <div class="code-container">
              <span class="code">${code}</span>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} EventApp. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: '"EventApp Support" <' + process.env.SMTP_USER + '>', // sender address
        to: email,
        subject: 'Verify your email address',
        html: htmlContent,
      });
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
