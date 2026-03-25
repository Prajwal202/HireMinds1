# Email Notification Setup for HireMinds

This document explains how to set up email notifications for bid acceptance and payment completion events.

## Configuration

Email settings are configured in `config/env.js`:

```javascript
SMTP_HOST: 'smtp.gmail.com',
SMTP_PORT: 587,
SMTP_USER: 'hiremindssupport@gmail.com',
SMTP_PASS: 'your-app-password-here',
FROM_EMAIL: 'hiremindssupport@gmail.com',
FROM_NAME: 'HireMinds Support'
```

## Gmail Setup Required

To send emails through Gmail, you need to:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password instead of your regular password

3. **Update the SMTP_PASS** environment variable with the app password

## Email Templates

The system sends emails for two events:

### 1. Bid Acceptance
- **To Freelancer**: Congratulations email with project details and next steps
- **To Recruiter**: Confirmation email with freelancer details

### 2. Payment Completion
- **To Freelancer**: Payment received notification with amount and milestone info
- **To Recruiter**: Payment processed confirmation

## Features

- Professional HTML email templates with responsive design
- Automatic email sending on bid acceptance
- Automatic email sending on payment completion
- Error handling that doesn't break the main functionality
- Logging of email sending status

## Testing

To test email functionality:

1. Update the test email address in `testEmail.js`
2. Run: `node testEmail.js`
3. Check your inbox for test emails

## Environment Variables

You can override the default settings by setting these environment variables:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Your Name
```

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**: 
   - Make sure you're using an App Password, not your regular password
   - Enable 2-Factor Authentication on your Google Account

2. **"Connection refused" error**:
   - Check your internet connection
   - Verify SMTP settings (host and port)

3. **Emails not sending**:
   - Check server logs for error messages
   - Verify email addresses are valid
   - Check spam/junk folders

### Security Notes:

- Never commit your actual password to version control
- Use environment variables for sensitive data
- Consider using a transactional email service like SendGrid for production

## Production Considerations

For production use, consider:

1. Using a dedicated transactional email service (SendGrid, Mailgun, etc.)
2. Setting up email queueing for better performance
3. Adding email analytics and tracking
4. Implementing unsubscribe functionality
5. Setting up proper bounce handling
