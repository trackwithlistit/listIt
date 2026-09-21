import os
import smtplib
import uuid
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

def send_otp_email(to_email, otp_code):
    """
    Sends a beautifully designed HTML OTP verification email using Gmail SMTP STARTTLS.
    Constructs a dual-format MIME message (HTML + Plain Text) to prevent spam classification.
    """
    smtp_host = current_app.config.get('SMTP_HOST') or os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(current_app.config.get('SMTP_PORT') or os.environ.get('SMTP_PORT', 587))
    smtp_user = current_app.config.get('SMTP_USER') or os.environ.get('SMTP_USER', '')
    smtp_pass = current_app.config.get('SMTP_PASS') or os.environ.get('SMTP_PASS', '')

    if smtp_pass:
        smtp_pass = smtp_pass.strip()

    subject = f"Your ListIt Verification Code: {otp_code}"

    # Plain Text Fallback
    text_content = (
        f"ListIt Account Verification\n\n"
        f"Your 6-digit verification code is: {otp_code}\n\n"
        f"This code is valid for 5 minutes. Please do not share this code with anyone.\n\n"
        f"If you did not request this email, please ignore it.\n\n"
        f"© {time.strftime('%Y')} ListIt. Track & Organize your favorite Anime, Movies & Web Series."
    )

    # HTML Email Template with ListIt Theme & Logo
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ListIt Email Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #0b0b12; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Container Box -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #141422; border: 1px solid #26263b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Top Accent Line -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #7C3AED 0%, #06B6D4 100%);"></td>
          </tr>

          <!-- Header Section with Logo -->
          <tr>
            <td align="center" style="padding: 36px 30px 20px 30px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="vertical-align: middle;">
                    <div style="background: linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%); border-radius: 12px; width: 44px; height: 44px; display: inline-block; text-align: center; line-height: 44px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);">
                      <span style="font-size: 22px; color: #ffffff; font-weight: bold; line-height: 44px;">🔖</span>
                    </div>
                  </td>
                  <td style="padding-left: 12px; vertical-align: middle;">
                    <span style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">list<span style="color: #06B6D4;">It</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 10px 0; letter-spacing: -0.3px;">Verify Your Email Address</h1>
              <p style="font-size: 14px; color: #94a3b8; margin: 0 0 28px 0; line-height: 1.6;">
                Welcome to <strong>ListIt</strong>! Use the 6-digit verification code below to complete your account registration:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #1a192e; border: 2px solid #7c3aed; border-radius: 14px; padding: 22px 15px; margin-bottom: 24px; box-shadow: 0 0 20px rgba(124, 58, 237, 0.2);">
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #a78bfa; letter-spacing: 12px; text-indent: 12px; line-height: 1;">
                  {otp_code}
                </div>
              </div>

              <!-- Expiry Badge -->
              <div style="display: inline-block; background-color: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 20px; padding: 6px 16px; margin-bottom: 28px;">
                <span style="font-size: 13px; font-weight: 600; color: #38bdf8;">⏰ Code expires in 5 minutes</span>
              </div>

              <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.5;">
                If you did not request this verification code, please ignore this email or contact support if you have security concerns.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="border-top: 1px solid #222235;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; text-align: center; background-color: #10101b;">
              <p style="font-size: 12px; color: #475569; margin: 0 0 8px 0;">
                Track, Discover & Organize Anime, Movies & Web Series
              </p>
              <p style="font-size: 11px; color: #334155; margin: 0;">
                © {time.strftime('%Y')} ListIt Application. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    # Build MIME Multipart Alternative Message
    msg = MIMEMultipart('alternative')
    msg['From'] = f"ListIt <{smtp_user}>"
    msg['To'] = to_email
    msg['Subject'] = subject
    msg['Reply-To'] = smtp_user
    msg['Message-ID'] = f"<{uuid.uuid4()}@listit.app>"
    msg['X-Mailer'] = "ListIt Security Mailer 2.0"

    part1 = MIMEText(text_content, 'plain', 'utf-8')
    part2 = MIMEText(html_content, 'html', 'utf-8')

    msg.attach(part1)
    msg.attach(part2)

    try:
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        print(f"[SMTP SUCCESS] Sent attractive HTML verification email to {to_email}")
        return True, "Verification email sent successfully"
    except Exception as e:
        print(f"[SMTP ERROR] Failed to send email to {to_email}: {e}")
        return False, str(e)
