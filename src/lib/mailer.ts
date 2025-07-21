import { createTransport } from 'nodemailer';

export const transporter = createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Generate verification email HTML without React components
const generateVerificationEmailHTML = (firstName: string, verificationUrl: string, appName: string, currentYear: number) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification Email</title>
        <style>
          /* Reset and base styles */
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            margin: 0;
            padding: 0;
          }
          
          /* Responsive styles */
          @media (max-width: 600px) {
            .container {
              width: 100% !important;
              padding: 16px !important;
            }
            .content-padding {
              padding-left: 16px !important;
              padding-right: 16px !important;
            }
            .main-heading {
              font-size: 20px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; width: 100%; background-color: #f3f4f6;">
        <!-- Email Body Table -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 16px;">
              <table 
                class="container" 
                role="presentation" 
                align="center" 
                border="0" 
                cellpadding="0" 
                cellspacing="0" 
                width="600" 
                style="width: 600px; margin: 0 auto;"
              >
                <!-- Main Content -->
                <tr>
                  <td 
                    class="content-padding" 
                    align="center" 
                    style="background-color: #ffffff; padding: 40px 32px; text-align: center; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);"
                  >
                    <!-- Greeting -->
                    <h1 class="main-heading" style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">
                      Bienvenue ${firstName} !
                    </h1>

                    <!-- Intro Lines -->
                    <p style="margin: 16px 0 0 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
                      Merci de vous être inscrit. Veuillez vérifier votre adresse e-mail et définir votre mot de passe en cliquant sur le lien ci-dessous :
                    </p>

                    <!-- Action Button -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top: 40px; margin-bottom: 0; margin-left: auto; margin-right: auto;">
                      <tr>
                        <td align="center">
                          <a 
                            href="${verificationUrl}" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style="display: inline-block; background-color: #6415ff; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; padding: 12px 24px;"
                          >
                            Vérifier l'e-mail et définir le mot de passe
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Outro Lines -->
                    <p style="margin: 24px 0 0 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
                      Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :
                    </p>

                    <p style="margin: 16px 0 0 0; font-size: 14px; color: #9ca3af; line-height: 1.5;">
                      <a href="${verificationUrl}" style="color: #6415ff; word-break: break-all;">
                        ${verificationUrl}
                      </a>
                    </p>

                    <p style="margin: 16px 0 0 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
                      Ce lien expirera dans 24 heures.
                    </p>

                    <!-- Salutation -->
                    <p style="margin: 32px 0 0 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
                      Cordialement,<br>${appName}
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 24px 0; font-size: 12px; color: #6b7280;">
                    © ${currentYear} ${appName}. Tous droits réservés.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

export const sendVerificationEmail = async (email: string, token: string, firstName: string) => {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'LiLLinker';
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;
  const currentYear = new Date().getFullYear();
  
  const verificationEmailHTML = generateVerificationEmailHTML(firstName, verificationUrl, appName, currentYear);
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Vérifiez votre e-mail et définissez votre mot de passe',
    html: verificationEmailHTML,
  });
};

// Generate account activation email HTML
const generateActivationEmailHTML = (fullName: string, loginUrl: string, appName: string, currentYear: number) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Compte Activé</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            margin: 0;
            padding: 0;
          }
          @media (max-width: 600px) {
            .container {
              width: 100% !important;
              padding: 16px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; width: 100%; background-color: #f3f4f6;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 16px;">
              <table class="container" role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="width: 600px; margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #ffffff; padding: 40px 32px; text-align: center; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">
                      Bonjour ${fullName} !
                    </h1>
                    <p style="margin: 16px 0 0 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
                      Votre compte a été activé et vous pouvez maintenant accéder à votre tableau de bord.
                    </p>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top: 40px; margin-bottom: 0; margin-left: auto; margin-right: auto;">
                      <tr>
                        <td align="center">
                          <a href="${loginUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #6415ff; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; padding: 12px 24px;">
                            Se connecter à votre compte
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 32px 0 0 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
                      Cordialement,<br>${appName}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 24px 0; font-size: 12px; color: #6b7280;">
                    © ${currentYear} ${appName}. Tous droits réservés.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

export const sendAccountActivationEmail = async (email: string, fullName: string) => {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'LilLinker';
  const loginUrl = `${baseUrl}/auth/login`;
  const currentYear = new Date().getFullYear();
  
  const activationEmailHTML = generateActivationEmailHTML(fullName, loginUrl, appName, currentYear);
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Votre compte est activé',
    html: activationEmailHTML,
  });
};