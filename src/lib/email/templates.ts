interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export const emailTemplates = {
  passwordReset: (resetUrl: string, userName: string): EmailTemplate => ({
    subject: 'Reset Your Frame Account Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - Frame</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Roboto Condensed', Arial, sans-serif; 
              line-height: 1.6; 
              color: #ffffff; 
              background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #000000;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(213, 255, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #D5FF00 0%, #a8cc00 100%);
              color: #000000; 
              padding: 40px 20px; 
              text-align: center;
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><polygon fill="%23000000" fill-opacity="0.1" points="0,20 100,0 100,20"/></svg>');
              background-size: 50px 20px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #000000;
              text-shadow: none;
              position: relative;
              z-index: 1;
            }
            .header h1 {
              font-size: 24px;
              font-weight: 600;
              margin: 0;
              position: relative;
              z-index: 1;
            }
            .content { 
              padding: 40px 30px; 
              background: #0a0a0a;
              color: #ffffff;
            }
            .content h2 {
              color: #D5FF00;
              font-size: 22px;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .content p {
              margin-bottom: 16px;
              color: #e0e0e0;
              font-size: 16px;
            }
            .button { 
              display: inline-block; 
              padding: 16px 32px; 
              background: linear-gradient(135deg, #D5FF00 0%, #a8cc00 100%);
              color: #000000; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 25px 0;
              font-weight: bold;
              font-size: 16px;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(213, 255, 0, 0.3);
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(213, 255, 0, 0.4);
            }
            .security-note {
              background: rgba(213, 255, 0, 0.1);
              border-left: 4px solid #D5FF00;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .security-note strong {
              color: #D5FF00;
            }
            .footer { 
              padding: 30px 20px; 
              text-align: center; 
              color: #888; 
              font-size: 14px;
              background: #050505;
              border-top: 1px solid #1a1a1a;
            }
            .footer-brand {
              color: #D5FF00;
              font-weight: bold;
            }
            .divider {
              height: 2px;
              background: linear-gradient(90deg, transparent, #D5FF00, transparent);
              margin: 20px 0;
            }
            @media (max-width: 600px) {
              .container { margin: 10px; }
              .content { padding: 30px 20px; }
              .header { padding: 30px 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo"><img src="/icons/full logo colored.svg" alt="🎬 FRAME" /></div>
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>We received a request to reset your Frame account password. Your cinematic journey shouldn't be interrupted by a forgotten password!</p>
              
              <div class="divider"></div>
              
              <p>Click the button below to create a new password and get back to streaming:</p>
              <a href="${resetUrl}" class="button">🔐 Reset My Password</a>
              
              <div class="security-note">
                <p><strong>Security Note:</strong> This reset link will expire in 1 hour for your account's protection.</p>
              </div>
              
              <p>If you didn't request this password reset, please ignore this email. Your account remains secure and your password won't be changed.</p>
              
              <p>Having trouble with the button? Copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #D5FF00; font-family: monospace; background: rgba(213, 255, 0, 0.1); padding: 10px; border-radius: 4px;">${resetUrl}</p>
            </div>
            <div class="footer">
              <p>Keep streaming, keep dreaming!</p>
              <p>Best regards,<br><span class="footer-brand">The Frame Team</span></p>
              <p style="margin-top: 15px; font-size: 12px;">© 2024 Frame Streaming Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
FRAME - Password Reset Request

Hello ${userName},

We received a request to reset your Frame account password. Your cinematic journey shouldn't be interrupted by a forgotten password!

To reset your password, visit the following link:
${resetUrl}

SECURITY NOTE: This reset link will expire in 1 hour for your account's protection.

If you didn't request this password reset, please ignore this email. Your account remains secure and your password won't be changed.

Keep streaming, keep dreaming!

Best regards,
The Frame Team

© 2024 Frame Streaming Platform. All rights reserved.
    `
  }),

  emailVerification: (verificationUrl: string, userName: string): EmailTemplate => ({
    subject: "Welcome to Frame - Verify Your Email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - Frame</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Roboto Condensed', Arial, sans-serif; 
              line-height: 1.6; 
              color: #ffffff; 
              background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #000000;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(213, 255, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #D5FF00 0%, #a8cc00 100%);
              color: #000000; 
              padding: 40px 20px; 
              text-align: center;
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><polygon fill="%23000000" fill-opacity="0.1" points="0,20 100,0 100,20"/></svg>');
              background-size: 50px 20px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #000000;
              position: relative;
              z-index: 1;
            }
            .header h1 {
              font-size: 24px;
              font-weight: 600;
              margin: 0;
              position: relative;
              z-index: 1;
            }
            .content { 
              padding: 40px 30px; 
              background: #0a0a0a;
              color: #ffffff;
            }
            .content h2 {
              color: #D5FF00;
              font-size: 22px;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .content p {
              margin-bottom: 16px;
              color: #e0e0e0;
              font-size: 16px;
            }
            .verification-button { 
              display: inline-block; 
              padding: 18px 36px; 
              background: linear-gradient(135deg, #D5FF00 0%, #a8cc00 100%);
              color: #000000; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 25px 0;
              font-weight: bold;
              font-size: 18px;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(213, 255, 0, 0.3);
            }
            .verification-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(213, 255, 0, 0.4);
            }
            .welcome-note {
              background: rgba(213, 255, 0, 0.1);
              border: 1px solid rgba(213, 255, 0, 0.3);
              padding: 20px;
              margin: 25px 0;
              border-radius: 8px;
              text-align: center;
            }
            .footer { 
              padding: 30px 20px; 
              text-align: center; 
              color: #888; 
              font-size: 14px;
              background: #050505;
              border-top: 1px solid #1a1a1a;
            }
            .footer-brand {
              color: #D5FF00;
              font-weight: bold;
            }
            .divider {
              height: 2px;
              background: linear-gradient(90deg, transparent, #D5FF00, transparent);
              margin: 20px 0;
            }
            .movie-emoji {
              font-size: 24px;
              margin: 0 5px;
            }
            @media (max-width: 600px) {
              .container { margin: 10px; }
              .content { padding: 30px 20px; }
              .header { padding: 30px 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo"><img src="/icons/full logo colored.svg" /></div>
              <h1>Welcome to Your Cinematic Journey!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}! 🍿</h2>
              <p>Welcome to <strong>Frame</strong> - where every story comes to life! We're excited to have you join our community of film enthusiasts.</p>
              
              <div class="welcome-note">
                <p style="margin: 0; color: #D5FF00; font-weight: bold;">🎭 Ready to explore amazing content? 🎭</p>
              </div>
              
              <p>To complete your registration and start streaming, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="verification-button">
                  ✨ Verify My Email & Start Streaming
                </a>
              </div>
              
              <div class="divider"></div>
              
              <p>Once verified, you'll have access to:</p>
              <ul style="color: #e0e0e0; margin: 15px 0; padding-left: 20px;">
                <li>🎬 Exclusive FSP short films and animations</li>
                <li>🎯 Personalized content recommendations</li>
                <li>💾 Save your favorite movies and create watchlists</li>
                <li>⭐ Rate and review content</li>
                <li>🔔 Get notified about new releases</li>
              </ul>
              
              <p>Having trouble with the button? Copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #D5FF00; font-family: monospace; background: rgba(213, 255, 0, 0.1); padding: 10px; border-radius: 4px;">${verificationUrl}</p>
            </div>
            <div class="footer">
              <p><span class="movie-emoji">🎬</span> The show must go on! <span class="movie-emoji">🍿</span></p>
              <p>Best regards,<br><span class="footer-brand">The Frame Team</span></p>
              <p style="margin-top: 15px; font-size: 12px;">© 2024 Frame Streaming Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
🎬 FRAME - Welcome to Your Cinematic Journey!

Hello ${userName}! 🍿

Welcome to Frame - where every story comes to life! We're excited to have you join our community of film enthusiasts.

🎭 Ready to explore amazing content? 🎭

To complete your registration and start streaming, please verify your email address by visiting:
${verificationUrl}

Once verified, you'll have access to:
🎬 Exclusive FSP short films and animations
🎯 Personalized content recommendations  
💾 Save your favorite movies and create watchlists
⭐ Rate and review content
🔔 Get notified about new releases

🎬 The show must go on! 🍿

Best regards,
The Frame Team

© 2024 Frame Streaming Platform. All rights reserved.
    `
  }),

  welcomeEmail: (userName: string): EmailTemplate => ({
    subject: '🎉 Welcome to Frame - Your Account is Verified!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Frame!</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Roboto Condensed', Arial, sans-serif; 
              line-height: 1.6; 
              color: #ffffff; 
              background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #000000;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(213, 255, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #D5FF00 0%, #a8cc00 100%);
              color: #000000; 
              padding: 40px 20px; 
              text-align: center;
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><polygon fill="%23000000" fill-opacity="0.1" points="0,20 100,0 100,20"/></svg>');
              background-size: 50px 20px;
            }
            .logo {
              font-size: 36px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #000000;
              position: relative;
              z-index: 1;
            }
            .header h1 {
              font-size: 26px;
              font-weight: 600;
              margin: 0;
              position: relative;
              z-index: 1;
            }
            .celebration {
              font-size: 48px;
              margin: 10px 0;
              position: relative;
              z-index: 1;
            }
            .content { 
              padding: 40px 30px; 
              background: #0a0a0a;
              color: #ffffff;
            }
            .content h2 {
              color: #D5FF00;
              font-size: 24px;
              margin-bottom: 20px;
              font-weight: 600;
              text-align: center;
            }
            .content p {
              margin-bottom: 16px;
              color: #e0e0e0;
              font-size: 16px;
            }
            .success-badge {
              background: linear-gradient(135deg, #D5FF00 0%, #a8cc00 100%);
              color: #000000;
              padding: 15px 25px;
              border-radius: 50px;
              font-weight: bold;
              text-align: center;
              margin: 25px auto;
              display: block;
              width: fit-content;
              font-size: 18px;
            }
            .features-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin: 30px 0;
            }
            .feature-card {
              background: rgba(213, 255, 0, 0.1);
              border: 1px solid rgba(213, 255, 0, 0.3);
              padding: 20px;
              border-radius: 8px;
              text-align: center;
            }
            .feature-icon {
              font-size: 32px;
              margin-bottom: 10px;
              display: block;
            }
            .feature-title {
              color: #D5FF00;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .cta-section {
              background: linear-gradient(135deg, rgba(213, 255, 0, 0.1) 0%, rgba(168, 204, 0, 0.1) 100%);
              border: 2px solid rgba(213, 255, 0, 0.3);
              padding: 25px;
              border-radius: 12px;
              text-align: center;
              margin: 30px 0;
            }
            .cta-button { 
              display: inline-block; 
              padding: 16px 32px; 
              background: linear-gradient(135deg, #D5FF00 0%, #a8cc00 100%);
              color: #000000; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 15px 10px;
              font-weight: bold;
              font-size: 16px;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(213, 255, 0, 0.3);
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(213, 255, 0, 0.4);
            }
            .footer { 
              padding: 30px 20px; 
              text-align: center; 
              color: #888; 
              font-size: 14px;
              background: #050505;
              border-top: 1px solid #1a1a1a;
            }
            .footer-brand {
              color: #D5FF00;
              font-weight: bold;
            }
            .divider {
              height: 2px;
              background: linear-gradient(90deg, transparent, #D5FF00, transparent);
              margin: 30px 0;
            }
            @media (max-width: 600px) {
              .container { margin: 10px; }
              .content { padding: 30px 20px; }
              .header { padding: 30px 20px; }
              .features-grid { grid-template-columns: 1fr; }
              .cta-button { display: block; margin: 10px 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo"><img src="/icons/full logo colored.svg" /></div>
              <div class="celebration">🎉✨🍿</div>
              <h1>Welcome ${userName}!</h1>
            </div>
            <div class="content">
              <div class="success-badge">
                ✅ Account Verified Successfully!
              </div>
              
              <h2>🎬 Lights, Camera, Action! 🎬</h2>
              
              <p>Congratulations! Your email has been successfully verified and your Frame account is now fully activated. You're all set to dive into our amazing collection of films and animations!</p>
              
              <div class="divider"></div>
              
              <div class="features-grid">
                <div class="feature-card">
                  <span class="feature-icon">🎭</span>
                  <div class="feature-title">Exclusive Content</div>
                  <p style="margin: 0; font-size: 14px;">Access FSP's premium short films and animations</p>
                </div>
                <div class="feature-card">
                  <span class="feature-icon">💾</span>
                  <div class="feature-title">Personal Library</div>
                  <p style="margin: 0; font-size: 14px;">Save favorites and create custom watchlists</p>
                </div>
                <div class="feature-card">
                  <span class="feature-icon">⭐</span>
                  <div class="feature-title">Rate & Review</div>
                  <p style="margin: 0; font-size: 14px;">Share your thoughts and discover new gems</p>
                </div>
                <div class="feature-card">
                  <span class="feature-icon">🔔</span>
                  <div class="feature-title">Stay Updated</div>
                  <p style="margin: 0; font-size: 14px;">Get notified about latest releases</p>
                </div>
              </div>
              
              <div class="cta-section">
                <h3 style="color: #D5FF00; margin-bottom: 15px;">🚀 Ready to Start Your Journey?</h3>
                <p style="margin-bottom: 20px;">Jump into your dashboard and start exploring incredible content!</p>
                <a href="${process.env.NEXTAUTH_URL}/dashboard" class="cta-button">
                  🎬 Go to Dashboard
                </a>
                <a href="${process.env.NEXTAUTH_URL}/" class="cta-button">
                  🍿 Browse Movies
                </a>
              </div>
              
              <p style="text-align: center; font-style: italic; color: #D5FF00;">
                "Every frame tells a story, and your story with us begins now!"
              </p>
              
              <p>If you have any questions or need assistance, our support team is here to help. Just reply to this email or visit our help center.</p>
            </div>
            <div class="footer">
              <p>🎬 Welcome to the Frame family! 🍿</p>
              <p>Best regards,<br><span class="footer-brand">The Frame Team</span></p>
              <p style="margin-top: 15px; font-size: 12px;">© 2024 Frame Streaming Platform. All rights reserved.</p>
              <p style="margin-top: 10px; font-size: 11px; color: #666;">
                🎭 Bringing stories to life, one frame at a time 🎭
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
🎬 FRAME - Welcome ${userName}! 🎉

✅ Account Verified Successfully!

🎬 Lights, Camera, Action! 🎬

Congratulations! Your email has been successfully verified and your Frame account is now fully activated. You're all set to dive into our amazing collection of films and animations!

What you can do now:
🎭 Access FSP's exclusive short films and animations
💾 Save favorites and create custom watchlists  
⭐ Rate and review content
🔔 Get notified about latest releases

🚀 Ready to Start Your Journey?

Visit your dashboard: ${process.env.NEXTAUTH_URL}/dashboard
Browse movies: ${process.env.NEXTAUTH_URL}/

"Every frame tells a story, and your story with us begins now!"

If you have any questions or need assistance, our support team is here to help. Just reply to this email or visit our help center.

🎬 Welcome to the Frame family! 🍿

Best regards,
The Frame Team

© 2024 Frame Streaming Platform. All rights reserved.
🎭 Bringing stories to life, one frame at a time 🎭
    `
  })
}