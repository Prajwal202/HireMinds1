const nodemailer = require('nodemailer');
const env = require('../config/env');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Bid acceptance email to freelancer
const sendBidAcceptanceEmailToFreelancer = async (freelancerEmail, freelancerName, jobTitle, companyName, bidAmount) => {
  const subject = '🎉 Congratulations! Your Bid Has Been Accepted';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bid Accepted - HireMinds</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #e8f5e8; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
          <p>Your bid has been accepted</p>
        </div>
        <div class="content">
          <p>Dear <strong>${freelancerName}</strong>,</p>
          <p>We're thrilled to inform you that your bid for the following project has been accepted:</p>
          
          <div class="details">
            <h3>📋 Project Details</h3>
            <p><strong>Job Title:</strong> ${jobTitle}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Accepted Bid Amount:</strong> ₹${bidAmount}</p>
          </div>
          
          <div class="highlight">
            <p><strong>🚀 Next Steps:</strong></p>
            <ul>
              <li>You can now start working on this project</li>
              <li>Communicate with the recruiter through our messaging system</li>
              <li>Submit your work through the project dashboard</li>
              <li>Track your progress and payments in real-time</li>
            </ul>
          </div>
          
          <p>Log in to your HireMinds dashboard to get started with the project.</p>
          
          <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
          </div>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <p>Best regards,<br>The HireMinds Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 HireMinds. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: freelancerEmail,
    subject,
    html,
    text: `Congratulations ${freelancerName}! Your bid for "${jobTitle}" at ${companyName} has been accepted. Bid amount: ₹${bidAmount}. Log in to your HireMinds dashboard to get started.`
  });
};

// Bid acceptance email to recruiter
const sendBidAcceptanceEmailToRecruiter = async (recruiterEmail, recruiterName, freelancerName, jobTitle, bidAmount) => {
  const subject = '✅ Bid Accepted - Project Allocation Successful';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bid Accepted - HireMinds</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #e8f5e8; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Project Allocation Successful</h1>
          <p>Your project has been assigned to a freelancer</p>
        </div>
        <div class="content">
          <p>Dear <strong>${recruiterName}</strong>,</p>
          <p>Great news! You have successfully accepted a bid for your project. Here are the details:</p>
          
          <div class="details">
            <h3>📋 Project Details</h3>
            <p><strong>Job Title:</strong> ${jobTitle}</p>
            <p><strong>Allocated Freelancer:</strong> ${freelancerName}</p>
            <p><strong>Accepted Bid Amount:</strong> ₹${bidAmount}</p>
          </div>
          
          <div class="highlight">
            <p><strong>🎯 What's Next:</strong></p>
            <ul>
              <li>The freelancer can now start working on your project</li>
              <li>You can communicate with them through our messaging system</li>
              <li>Track project progress through your dashboard</li>
              <li>Release payments as milestones are completed</li>
            </ul>
          </div>
          
          <p>Manage your project and communicate with the freelancer through your HireMinds dashboard.</p>
          
          <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/dashboard" class="btn">Manage Project</a>
          </div>
          
          <p>If you need any assistance, our support team is here to help.</p>
          
          <p>Best regards,<br>The HireMinds Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 HireMinds. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: recruiterEmail,
    subject,
    html,
    text: `Project allocation successful! Your project "${jobTitle}" has been assigned to ${freelancerName} for ₹${bidAmount}. Manage your project through your HireMinds dashboard.`
  });
};

// Payment completion email to freelancer
const sendPaymentCompletionEmailToFreelancer = async (freelancerEmail, freelancerName, jobTitle, companyName, amount, milestoneLevel) => {
  const subject = '💰 Payment Received - Milestone Completed';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Received - HireMinds</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Payment Received!</h1>
          <p>Your milestone payment has been processed</p>
        </div>
        <div class="content">
          <p>Dear <strong>${freelancerName}</strong>,</p>
          <p>Great news! A payment has been processed for your work on the following project:</p>
          
          <div class="details">
            <h3>💳 Payment Details</h3>
            <p><strong>Project:</strong> ${jobTitle}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Milestone Level:</strong> ${milestoneLevel}</p>
            <p><strong>Amount Received:</strong> <span class="amount">₹${amount}</span></p>
          </div>
          
          <div class="highlight">
            <p><strong>🎉 Congratulations!</strong></p>
            <p>Your hard work has been recognized and rewarded. Keep up the excellent work!</p>
          </div>
          
          <p>The payment has been transferred to your registered UPI ID. You should receive it shortly.</p>
          
          <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/dashboard" class="btn">View Dashboard</a>
          </div>
          
          <p>Thank you for your dedication to delivering quality work.</p>
          
          <p>Best regards,<br>The HireMinds Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 HireMinds. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: freelancerEmail,
    subject,
    html,
    text: `Payment received! You have been paid ₹${amount} for milestone ${milestoneLevel} of your work on "${jobTitle}" for ${companyName}. The payment has been transferred to your UPI ID.`
  });
};

// Payment completion email to recruiter
const sendPaymentCompletionEmailToRecruiter = async (recruiterEmail, recruiterName, freelancerName, jobTitle, amount, milestoneLevel) => {
  const subject = '✅ Payment Processed - Milestone Completed';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Processed - HireMinds</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #d1ecf1; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #007bff; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Payment Processed</h1>
          <p>Milestone payment completed successfully</p>
        </div>
        <div class="content">
          <p>Dear <strong>${recruiterName}</strong>,</p>
          <p>A payment has been successfully processed for the following project:</p>
          
          <div class="details">
            <h3>💳 Payment Details</h3>
            <p><strong>Project:</strong> ${jobTitle}</p>
            <p><strong>Freelancer:</strong> ${freelancerName}</p>
            <p><strong>Milestone Level:</strong> ${milestoneLevel}</p>
            <p><strong>Amount Paid:</strong> <span class="amount">₹${amount}</span></p>
          </div>
          
          <div class="highlight">
            <p><strong>📋 Payment Summary:</strong></p>
            <p>The payment has been successfully transferred to the freelancer's UPI ID. This milestone is now marked as completed.</p>
          </div>
          
          <p>You can track the project progress and manage future payments through your dashboard.</p>
          
          <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/dashboard" class="btn">Manage Project</a>
          </div>
          
          <p>Thank you for using HireMinds for your project needs.</p>
          
          <p>Best regards,<br>The HireMinds Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 HireMinds. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: recruiterEmail,
    subject,
    html,
    text: `Payment processed successfully! ₹${amount} has been paid to ${freelancerName} for milestone ${milestoneLevel} of project "${jobTitle}". Manage your project through your HireMinds dashboard.`
  });
};

// Transaction ID submission email to recruiter
const sendTransactionSubmissionEmailToRecruiter = async (recruiterEmail, recruiterName, freelancerName, jobTitle, amount, transactionId, milestoneLevel) => {
  const subject = '📋 Transaction ID Submitted - Action Required';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transaction ID Submitted - HireMinds</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .btn-accept { background: #28a745; margin-right: 10px; }
        .btn-reject { background: #dc3545; }
        .transaction-id { font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px solid #dee2e6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Transaction ID Submitted</h1>
          <p>Action Required</p>
        </div>
        <div class="content">
          <p>Dear <strong>${recruiterName}</strong>,</p>
          <p>A transaction ID has been submitted for the following project. Please review and take action:</p>
          
          <div class="details">
            <h3>💳 Transaction Details</h3>
            <p><strong>Project:</strong> ${jobTitle}</p>
            <p><strong>Freelancer:</strong> ${freelancerName}</p>
            <p><strong>Milestone Level:</strong> ${milestoneLevel}</p>
            <p><strong>Amount:</strong> ₹${amount}</p>
            <p><strong>Transaction ID:</strong> <span class="transaction-id">${transactionId}</span></p>
          </div>
          
          <div class="highlight">
            <p><strong>🎯 Action Required:</strong></p>
            <p>Please verify the transaction and either accept or reject it:</p>
            <ul>
              <li><strong>Accept:</strong> If you have successfully made the payment</li>
              <li><strong>Reject:</strong> If the transaction ID is incorrect or payment was not made</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/dashboard" class="btn btn-accept">Accept Transaction</a>
            <a href="${env.FRONTEND_URL}/dashboard" class="btn btn-reject">Reject Transaction</a>
          </div>
          
          <p>Please review this transaction at your earliest convenience to ensure smooth project progress.</p>
          
          <p>Best regards,<br>The HireMinds Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 HireMinds. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: recruiterEmail,
    subject,
    html,
    text: `Transaction ID submitted: ${freelancerName} has submitted transaction ID ${transactionId} for ₹${amount} payment on project "${jobTitle}". Please review and accept or reject this transaction.`
  });
};

// Transaction ID acceptance email to freelancer
const sendTransactionAcceptanceEmailToFreelancer = async (freelancerEmail, freelancerName, jobTitle, companyName, amount, transactionId, milestoneLevel) => {
  const subject = '✅ Transaction Accepted - Payment Confirmed';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transaction Accepted - HireMinds</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #e8f5e8; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #28a745; }
        .transaction-id { font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px solid #dee2e6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Transaction Accepted!</h1>
          <p>Your payment has been confirmed</p>
        </div>
        <div class="content">
          <p>Dear <strong>${freelancerName}</strong>,</p>
          <p>Great news! Your transaction has been accepted and verified by the recruiter:</p>
          
          <div class="details">
            <h3>💳 Payment Details</h3>
            <p><strong>Project:</strong> ${jobTitle}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Milestone Level:</strong> ${milestoneLevel}</p>
            <p><strong>Amount:</strong> <span class="amount">₹${amount}</span></p>
            <p><strong>Transaction ID:</strong> <span class="transaction-id">${transactionId}</span></p>
          </div>
          
          <div class="highlight">
            <p><strong>🎉 Congratulations!</strong></p>
            <p>Your payment has been successfully processed and confirmed. The milestone is now marked as completed.</p>
          </div>
          
          <p>You can continue working on the next milestone or celebrate this achievement!</p>
          
          <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/dashboard" class="btn">View Dashboard</a>
          </div>
          
          <p>Thank you for your excellent work and dedication to the project.</p>
          
          <p>Best regards,<br>The HireMinds Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 HireMinds. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: freelancerEmail,
    subject,
    html,
    text: `Transaction accepted! Your payment of ₹${amount} for project "${jobTitle}" has been confirmed. Transaction ID: ${transactionId}. The milestone is now marked as completed.`
  });
};

// Transaction ID rejection email to freelancer
const sendTransactionRejectionEmailToFreelancer = async (freelancerEmail, freelancerName, jobTitle, companyName, amount, transactionId, milestoneLevel, rejectionReason = 'Invalid transaction details') => {
  const subject = '❌ Transaction Rejected - Action Required';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transaction Rejected - HireMinds</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .transaction-id { font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px solid #dee2e6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Transaction Rejected</h1>
          <p>Action Required</p>
        </div>
        <div class="content">
          <p>Dear <strong>${freelancerName}</strong>,</p>
          <p>We regret to inform you that your submitted transaction has been rejected by the recruiter:</p>
          
          <div class="details">
            <h3>💳 Transaction Details</h3>
            <p><strong>Project:</strong> ${jobTitle}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Milestone Level:</strong> ${milestoneLevel}</p>
            <p><strong>Amount:</strong> ₹${amount}</p>
            <p><strong>Transaction ID:</strong> <span class="transaction-id">${transactionId}</span></p>
          </div>
          
          <div class="highlight">
            <p><strong>⚠️ Rejection Reason:</strong></p>
            <p>${rejectionReason}</p>
          </div>
          
          <div class="highlight">
            <p><strong>🎯 Next Steps:</strong></p>
            <ul>
              <li>Please verify the transaction details with your payment provider</li>
              <li>Contact the recruiter if you believe this is an error</li>
              <li>Submit a new transaction ID with the correct details</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/dashboard" class="btn">Submit New Transaction</a>
          </div>
          
          <p>If you need assistance or believe this rejection was made in error, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The HireMinds Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 HireMinds. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: freelancerEmail,
    subject,
    html,
    text: `Transaction rejected: Your submitted transaction ID ${transactionId} for ₹${amount} on project "${jobTitle}" has been rejected. Reason: ${rejectionReason}. Please submit a new transaction ID with correct details.`
  });
};

// Bid submission email to recruiter
const sendBidSubmissionEmailToRecruiter = async (recruiterEmail, recruiterName, freelancerName, jobTitle, bidAmount, coverLetter) => {
  const subject = '📋 New Bid Received - Action Required';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Bid Received - HireMinds</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #d1ecf1; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .cover-letter { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin: 15px 0; font-style: italic; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 New Bid Received!</h1>
          <p>A freelancer has submitted a bid for your project</p>
        </div>
        <div class="content">
          <p>Dear <strong>${recruiterName}</strong>,</p>
          <p>Great news! A new bid has been submitted for your project. Here are the details:</p>
          
          <div class="details">
            <h3>💼 Bid Details</h3>
            <p><strong>Project:</strong> ${jobTitle}</p>
            <p><strong>Freelancer:</strong> ${freelancerName}</p>
            <p><strong>Bid Amount:</strong> <span class="amount">₹${bidAmount}</span></p>
          </div>
          
          ${coverLetter ? `
          <div class="cover-letter">
            <h4>📝 Cover Letter:</h4>
            <p>${coverLetter}</p>
          </div>
          ` : ''}
          
          <div class="highlight">
            <p><strong>🎯 Next Steps:</strong></p>
            <ul>
              <li>Review the freelancer's bid and cover letter</li>
              <li>Check the freelancer's profile and ratings</li>
              <li>Accept or reject the bid at your discretion</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/dashboard" class="btn">Review Bids</a>
          </div>
          
          <p>Hurry! Other freelancers may also submit bids. Make your decision soon to secure the best talent.</p>
          
          <p>Best regards,<br>The HireMinds Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 HireMinds. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: recruiterEmail,
    subject,
    html,
    text: `New bid received: ${freelancerName} has submitted a bid of ₹${bidAmount} for your project "${jobTitle}". Review the bid and cover letter in your HireMinds dashboard.`
  });
};

// Bid submission confirmation email to freelancer
const sendBidSubmissionConfirmationEmailToFreelancer = async (freelancerEmail, freelancerName, jobTitle, companyName, bidAmount) => {
  const subject = '✅ Bid Submitted Successfully';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bid Submitted - HireMinds</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #e8f5e8; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Bid Submitted Successfully!</h1>
          <p>Your bid has been received</p>
        </div>
        <div class="content">
          <p>Dear <strong>${freelancerName}</strong>,</p>
          <p>Congratulations! Your bid has been successfully submitted for the following project:</p>
          
          <div class="details">
            <h3>💼 Bid Details</h3>
            <p><strong>Project:</strong> ${jobTitle}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Your Bid Amount:</strong> <span class="amount">₹${bidAmount}</span></p>
          </div>
          
          <div class="highlight">
            <p><strong>🎯 What Happens Next:</strong></p>
            <ul>
              <li>The recruiter will review your bid and cover letter</li>
              <li>You'll receive an email if your bid is accepted</li>
              <li>You can track all your bids in your dashboard</li>
              <li>Keep an eye on your email for updates!</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/dashboard" class="btn">View Your Bids</a>
          </div>
          
          <p>Good luck! We hope you get this project.</p>
          
          <p>Best regards,<br>The HireMinds Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 HireMinds. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: freelancerEmail,
    subject,
    html,
    text: `Bid submitted successfully! Your bid of ₹${bidAmount} for "${jobTitle}" at ${companyName} has been received. The recruiter will review your bid and you'll be notified if accepted.`
  });
};

// Level completion email to recruiter
const sendLevelCompletionEmailToRecruiter = async (recruiterEmail, recruiterName, freelancerName, jobTitle, level, status, completionPercentage) => {
  const subject = `🎯 Milestone Completed - Level ${level} Finished`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Milestone Completed - HireMinds</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #e8f5e8; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .progress-bar { background: #e9ecef; border-radius: 10px; height: 20px; margin: 10px 0; }
        .progress-fill { background: linear-gradient(90deg, #28a745, #20c997); height: 100%; border-radius: 10px; transition: width 0.3s ease; }
        .level-badge { display: inline-block; background: #28a745; color: white; padding: 5px 10px; border-radius: 15px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Milestone Completed!</h1>
          <p>Great progress on your project</p>
        </div>
        <div class="content">
          <p>Dear <strong>${recruiterName}</strong>,</p>
          <p>Excellent news! A milestone has been completed for your project:</p>
          
          <div class="details">
            <h3>📊 Milestone Details</h3>
            <p><strong>Project:</strong> ${jobTitle}</p>
            <p><strong>Freelancer:</strong> ${freelancerName}</p>
            <p><strong>Level Completed:</strong> <span class="level-badge">Level ${level}</span></p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Overall Progress:</strong> ${completionPercentage}%</p>
            
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${completionPercentage}%"></div>
            </div>
          </div>
          
          <div class="highlight">
            <p><strong>🎉 Congratulations!</strong></p>
            <p>Your project is moving forward smoothly. The freelancer has successfully completed this milestone.</p>
          </div>
          
          <div class="highlight">
            <p><strong>💰 Next Steps:</strong></p>
            <ul>
              <li>Review the completed work for this milestone</li>
              <li>Process the payment for this milestone if satisfied</li>
              <li>The freelancer can proceed to the next level</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/dashboard" class="btn">Review Project</a>
          </div>
          
          <p>Keep up the great momentum! Your project is on track for successful completion.</p>
          
          <p>Best regards,<br>The HireMinds Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 HireMinds. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: recruiterEmail,
    subject,
    html,
    text: `Milestone completed: ${freelancerName} has completed Level ${level} (${status}) for your project "${jobTitle}". Overall progress: ${completionPercentage}%. Review the work and process payment.`
  });
};

// Level completion confirmation email to freelancer
const sendLevelCompletionEmailToFreelancer = async (freelancerEmail, freelancerName, jobTitle, companyName, level, status, completionPercentage) => {
  const subject = `🎉 Milestone Completed - Level ${level} Finished!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Milestone Completed - HireMinds</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .progress-bar { background: #e9ecef; border-radius: 10px; height: 20px; margin: 10px 0; }
        .progress-fill { background: linear-gradient(90deg, #ffc107, #ff9800); height: 100%; border-radius: 10px; transition: width 0.3s ease; }
        .level-badge { display: inline-block; background: #ffc107; color: white; padding: 5px 10px; border-radius: 15px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Milestone Completed!</h1>
          <p>Great work on your project!</p>
        </div>
        <div class="content">
          <p>Dear <strong>${freelancerName}</strong>,</p>
          <p>Congratulations! You have successfully completed a milestone for your project:</p>
          
          <div class="details">
            <h3>📊 Milestone Details</h3>
            <p><strong>Project:</strong> ${jobTitle}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Level Completed:</strong> <span class="level-badge">Level ${level}</span></p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Overall Progress:</strong> ${completionPercentage}%</p>
            
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${completionPercentage}%"></div>
            </div>
          </div>
          
          <div class="highlight">
            <p><strong>🎉 Excellent Work!</strong></p>
            <p>Your dedication and hard work are paying off. The recruiter has been notified of your progress.</p>
          </div>
          
          <div class="highlight">
            <p><strong>🎯 What's Next:</strong></p>
            <ul>
              <li>Wait for the recruiter to review your work</li>
              <li>Payment for this milestone will be processed</li>
              <li>You can then proceed to the next level</li>
              <li>Keep up the excellent work!</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${env.FRONTEND_URL}/dashboard" class="btn">View Dashboard</a>
          </div>
          
          <p>You're doing an amazing job! Every milestone brings you closer to project completion.</p>
          
          <p>Best regards,<br>The HireMinds Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 HireMinds. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: freelancerEmail,
    subject,
    html,
    text: `Milestone completed! You've successfully finished Level ${level} (${status}) for "${jobTitle}" at ${companyName}. Overall progress: ${completionPercentage}%. The recruiter will review your work and process payment.`
  });
};

module.exports = {
  sendEmail,
  sendBidAcceptanceEmailToFreelancer,
  sendBidAcceptanceEmailToRecruiter,
  sendBidSubmissionEmailToRecruiter,
  sendBidSubmissionConfirmationEmailToFreelancer,
  sendPaymentCompletionEmailToFreelancer,
  sendPaymentCompletionEmailToRecruiter,
  sendTransactionSubmissionEmailToRecruiter,
  sendTransactionAcceptanceEmailToFreelancer,
  sendTransactionRejectionEmailToFreelancer,
  sendLevelCompletionEmailToRecruiter,
  sendLevelCompletionEmailToFreelancer
};
