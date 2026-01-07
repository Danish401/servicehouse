
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const Booking = require("../models/Booking");
const Employee = require("../models/Employee");
const Customer = require("../models/User");
const { createEmailTransport, getEmailConfig, sendEmailWithRetry } = require("../utils/emailTransport");

// ✅ Test Email Configuration Endpoint
exports.testEmail = async (req, res) => {
  try {
    // Check if email configuration exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email configuration missing",
        details: {
          EMAIL_USER: process.env.EMAIL_USER ? "✅ Set" : "❌ Missing",
          EMAIL_PASS: process.env.EMAIL_PASS ? "✅ Set" : "❌ Missing",
        },
        instruction: "Please set EMAIL_USER and EMAIL_PASS in Render.com environment variables",
      });
    }

    const transporter = createEmailTransport();

    // Try sending a test email
    const testEmail = req.body.testEmail || process.env.EMAIL_USER;
    const info = await transporter.sendMail({
      from: `"House Service Support Team" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: "Test Email - Email Service Working!",
      text: "This is a test email. Your email service is configured correctly!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4caf50;">✅ Email Service Test Successful!</h2>
          <p>Your email service is configured correctly and working.</p>
          <p>You can now receive booking notifications and cancellation emails.</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Email service is working correctly!",
      details: {
        emailUser: process.env.EMAIL_USER,
        transport: getEmailConfig(),
        testEmailSentTo: testEmail,
        messageId: info.messageId,
        connectionStatus: "Sent",
      },
    });
  } catch (error) {
    console.error("Email test failed:", error);
    res.status(500).json({
      success: false,
      message: "Email test failed",
      error: error.message,
      details: {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
      },
      troubleshooting: {
        step1: "Check if EMAIL_USER and EMAIL_PASS are set in Render.com",
        step2: "Verify EMAIL_PASS is a Gmail App Password (not regular password)",
        step3: "Ensure 2-Step Verification is enabled on Gmail account",
        step4: "Check Render logs for more details",
      },
    });
  }
};

// ✅ Send Booking Notification Email to Employee (Non-blocking with retry)
const sendBookingNotificationToEmployee = async (employeeEmail, employeeName, customerName, customerEmail, customerPhone, bookingDetails) => {
  // Run in background - don't block booking creation
  setImmediate(async () => {
    try {
      // Validate email configuration
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Email configuration missing: EMAIL_USER or EMAIL_PASS not set");
        return;
      }

      const formattedDate = new Date(bookingDetails.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
      from: `"House Service Support Team" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: `New Booking Request from ${customerName}`,
      text: `Dear ${employeeName || "Employee"},
    
    You have received a new booking request!
    
    Customer Details:
    - Name: ${customerName}
    - Email: ${customerEmail}
    - Phone: ${customerPhone || "Not provided"}
    
    Booking Details:
    - Date: ${formattedDate}
    - Time: ${bookingDetails.time}
    - Address: ${bookingDetails.address || "Not provided"}
    - Notes: ${bookingDetails.notes || "No additional notes"}
    
    Please log in to your account to accept or reject this booking.
    
    Best Regards,
    House Service Support Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #6E6ADE; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">New Booking Request!</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 5px 5px;">
            <p style="font-size: 16px; color: #333;">Dear ${employeeName || "Employee"},</p>
            <p style="font-size: 16px; color: #333;">You have received a new booking request from a customer.</p>
            
            <div style="background-color: #E2DDFE; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Customer Details:</h3>
              <p style="margin: 5px 0; color: #333;"><strong>Name:</strong> ${customerName}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> ${customerEmail}</p>
              ${customerPhone ? `<p style="margin: 5px 0; color: #333;"><strong>Phone:</strong> ${customerPhone}</p>` : ''}
            </div>

            <div style="background-color: #F0F0F0; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Booking Details:</h3>
              <p style="margin: 5px 0; color: #333;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Time:</strong> ${bookingDetails.time}</p>
              ${bookingDetails.address ? `<p style="margin: 5px 0; color: #333;"><strong>Address:</strong> ${bookingDetails.address}</p>` : ''}
              ${bookingDetails.notes ? `<p style="margin: 5px 0; color: #333;"><strong>Notes:</strong> ${bookingDetails.notes}</p>` : ''}
            </div>

            <p style="font-size: 16px; color: #333;">Please log in to your account to accept or reject this booking.</p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">Best Regards,<br/> <strong>House Service Support Team</strong></p>
          </div>
        </div>
      `,
      };

      // Use retry function with timeout
      const result = await sendEmailWithRetry(mailOptions, 2);
      
      if (result.success) {
        console.log("✅ Booking notification email sent to employee:", result.info.messageId);
        console.log("   Employee Email:", employeeEmail);
      } else {
        console.error("❌ Failed to send booking notification email to employee after retries");
        console.error("   Employee Email:", employeeEmail);
        console.error("   Error:", result.error?.message || "Unknown error");
      }
    } catch (error) {
      console.error("❌ Error in sendBookingNotificationToEmployee:", error.message);
      // Don't throw error - booking should still succeed even if email fails
    }
  });
};

// ✅ Send Booking Status Update Email to Customer
const sendBookingStatusUpdateToCustomer = async (customerEmail, customerName, employeeName, bookingDetails, status, bookingId) => {
  try {
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email configuration missing: EMAIL_USER or EMAIL_PASS not set");
      return;
    }

    const transporter = createEmailTransport();

    // Verify connection
    // Connection verification removed - causes timeout on Render.com
    // Emails will be sent directly without verification

    const formattedDate = new Date(bookingDetails.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let statusMessage = "";
    let statusColor = "#6E6ADE";
    let statusTextColor = "#4caf50";

    switch(status) {
      case "Accepted":
        statusMessage = "Your booking has been accepted!";
        statusColor = "#4caf50";
        statusTextColor = "#4caf50";
        break;
      case "Rejected":
        statusMessage = "Your booking has been rejected.";
        statusColor = "#f44336";
        statusTextColor = "#f44336";
        break;
      case "Completed":
        statusMessage = "Your booking has been completed!";
        statusColor = "#2196F3";
        statusTextColor = "#2196F3";
        break;
      case "Pending":
        statusMessage = "Your booking is pending confirmation.";
        statusColor = "#FF9800";
        statusTextColor = "#FF9800";
        break;
      default:
        statusMessage = `Your booking status has been updated to ${status}.`;
        statusTextColor = "#6E6ADE";
    }

    // Format booking ID for display
    const displayBookingId = bookingId ? bookingId.toString().substring(0, 8).toUpperCase() : "N/A";

    let info = await transporter.sendMail({
      from: `"House Service Support Team" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Booking Status Update: ${status}`,
      text: `Dear ${customerName || "Customer"},
    
    ${statusMessage}
    
    Service Provider: ${employeeName}
    
    Booking Details:
    - Booking ID: ${displayBookingId}
    - Date: ${formattedDate}
    - Time: ${bookingDetails.time}
    - Address: ${bookingDetails.address || "Not provided"}
    - Status: ${status}
    
    ${status === "Accepted" ? "Your service provider will contact you soon. Please be available at the scheduled time." : ""}
    ${status === "Rejected" ? "Unfortunately, the service provider is unable to accept this booking at this time. Please try booking another time slot or a different service provider." : ""}
    ${status === "Completed" ? "We hope you had a great experience! Please consider leaving a review." : ""}
    
    For any queries or support, please contact us at:
    Email: houseservicesup@gmail.com
    Phone: +91-70092-36647
    
    Best Regards,
    House Service Support Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                  <!-- Header Banner -->
                  <tr>
                    <td style="background-color: ${statusColor}; padding: 35px 20px; text-align: center;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td align="center">
                            <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: bold; letter-spacing: 0.5px; line-height: 1.3; font-family: Arial, sans-serif;">${statusMessage}</h1>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <!-- Greeting -->
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">Dear ${customerName || "Customer"},</p>
                      <p style="margin: 0 0 25px 0; font-size: 16px; color: #333333; line-height: 1.6;">${statusMessage}</p>
                      
                      <!-- Service Provider Box -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                        <tr>
                          <td style="background-color: #E8E0FE; padding: 18px 20px; border-radius: 6px;">
                            <p style="margin: 0; font-size: 15px; color: #333333; line-height: 1.5;">
                              <strong style="color: #333333;">Service Provider:</strong> ${employeeName}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Booking Details Box -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                        <tr>
                          <td style="background-color: #F5F5F5; padding: 20px; border-radius: 6px;">
                            <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333333; font-weight: bold;">Booking Details:</h3>
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 6px 0;">
                                  <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">
                                    <strong style="color: #333333;">Booking ID:</strong> ${displayBookingId}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0;">
                                  <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">
                                    <strong style="color: #333333;">Date:</strong> ${formattedDate}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0;">
                                  <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">
                                    <strong style="color: #333333;">Time:</strong> ${bookingDetails.time}
                                  </p>
                                </td>
                              </tr>
                              ${bookingDetails.address ? `
                              <tr>
                                <td style="padding: 6px 0;">
                                  <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">
                                    <strong style="color: #333333;">Address:</strong> ${bookingDetails.address}
                                  </p>
                                </td>
                              </tr>
                              ` : ''}
                              <tr>
                                <td style="padding: 6px 0;">
                                  <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">
                                    <strong style="color: #333333;">Status:</strong> 
                                    <span style="color: ${statusTextColor}; font-weight: bold;">${status}</span>
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Next Steps Section (for Accepted status) -->
                      ${status === "Accepted" ? `
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
                        <tr>
                          <td style="background-color: #F0F9F4; padding: 18px 20px; border-radius: 6px; border-left: 4px solid #4caf50;">
                            <p style="margin: 0 0 8px 0; font-size: 15px; color: #333333; font-weight: bold;">Next Steps:</p>
                            <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">Your service provider will contact you soon. Please be available at the scheduled time.</p>
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      <!-- Additional Messages for other statuses -->
                      ${status === "Rejected" ? `
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
                        <tr>
                          <td style="background-color: #FFF5F5; padding: 18px 20px; border-radius: 6px; border-left: 4px solid #f44336;">
                            <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">Unfortunately, the service provider is unable to accept this booking at this time. Please try booking another time slot or a different service provider.</p>
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      ${status === "Completed" ? `
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
                        <tr>
                          <td style="background-color: #EFF8FF; padding: 18px 20px; border-radius: 6px; border-left: 4px solid #2196F3;">
                            <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">We hope you had a great experience! Please consider leaving a review.</p>
                          </td>
                        </tr>
                      </table>
                      ` : ''}

                      <!-- Contact Information -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #e0e0e0;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 10px 0; font-size: 13px; color: #666666; line-height: 1.6;">
                              For any queries or support, please contact us at:
                            </p>
                            <p style="margin: 0 0 5px 0; font-size: 13px; color: #333333; line-height: 1.6;">
                              <strong>Email:</strong> <a href="mailto:houseservicesup@gmail.com" style="color: #4caf50; text-decoration: none;">houseservicesup@gmail.com</a>
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 13px; color: #333333; line-height: 1.6;">
                              <strong>Phone:</strong> <a href="tel:+917009236647" style="color: #4caf50; text-decoration: none;">+91-70092-36647</a>
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Closing -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td>
                            <p style="margin: 20px 0 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                              Best Regards,<br/>
                              <strong style="color: #333333;">House Service Support Team</strong>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    
    console.log("✅ Booking status update email sent to customer:", info.messageId);
    console.log("   Customer Email:", customerEmail);
  } catch (error) {
    console.error("❌ Error sending booking status update email to customer:", error.message);
    console.error("   Error Details:", {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    // Don't throw error - status update should still succeed even if email fails
  }
};

// ✅ Send Booking Cancellation Email to Employee (when customer cancels)
const sendBookingCancellationToEmployee = async (employeeEmail, employeeName, customerName, customerEmail, bookingDetails, bookingId) => {
  try {
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email configuration missing: EMAIL_USER or EMAIL_PASS not set");
      return;
    }

    const transporter = createEmailTransport();

    // Verify connection
    // Connection verification removed - causes timeout on Render.com
    // Emails will be sent directly without verification

    const formattedDate = new Date(bookingDetails.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const statusColor = "#f44336";
    const statusTextColor = "#f44336";
    const statusMessage = "Booking Cancelled by Customer";

    // Format booking ID for display
    const displayBookingId = bookingId ? bookingId.toString().substring(0, 8).toUpperCase() : "N/A";

    let info = await transporter.sendMail({
      from: `"House Service Support Team" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: `Booking Cancelled: ${customerName}`,
      text: `Dear ${employeeName || "Employee"},
    
    The customer has cancelled their booking.
    
    Customer Details:
    - Name: ${customerName}
    - Email: ${customerEmail || "Not provided"}
    
    Booking Details:
    - Booking ID: ${displayBookingId}
    - Date: ${formattedDate}
    - Time: ${bookingDetails.time}
    - Address: ${bookingDetails.address || "Not provided"}
    - Status: Cancelled
    
    The booking has been cancelled by the customer. You can now accept other bookings for this time slot.
    
    For any queries or support, please contact us at:
    Email: houseservicesup@gmail.com
    Phone: +91-70092-36647
    
    Best Regards,
    House Service Support Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                  <!-- Header Banner -->
                  <tr>
                    <td style="background-color: ${statusColor}; padding: 35px 20px; text-align: center;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td align="center">
                            <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: bold; letter-spacing: 0.5px; line-height: 1.3; font-family: Arial, sans-serif;">${statusMessage}</h1>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <!-- Greeting -->
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">Dear ${employeeName || "Employee"},</p>
                      <p style="margin: 0 0 25px 0; font-size: 16px; color: #333333; line-height: 1.6;">The customer has cancelled their booking.</p>
                      
                      <!-- Customer Details Box -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                        <tr>
                          <td style="background-color: #E8E0FE; padding: 18px 20px; border-radius: 6px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #333333; font-weight: bold;">Customer Details:</h3>
                            <p style="margin: 5px 0; font-size: 14px; color: #333333; line-height: 1.5;">
                              <strong style="color: #333333;">Name:</strong> ${customerName}
                            </p>
                            ${customerEmail ? `
                            <p style="margin: 5px 0; font-size: 14px; color: #333333; line-height: 1.5;">
                              <strong style="color: #333333;">Email:</strong> ${customerEmail}
                            </p>
                            ` : ''}
                          </td>
                        </tr>
                      </table>

                      <!-- Booking Details Box -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
                        <tr>
                          <td style="background-color: #F5F5F5; padding: 20px; border-radius: 6px;">
                            <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333333; font-weight: bold;">Booking Details:</h3>
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 6px 0;">
                                  <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">
                                    <strong style="color: #333333;">Booking ID:</strong> ${displayBookingId}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0;">
                                  <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">
                                    <strong style="color: #333333;">Date:</strong> ${formattedDate}
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0;">
                                  <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">
                                    <strong style="color: #333333;">Time:</strong> ${bookingDetails.time}
                                  </p>
                                </td>
                              </tr>
                              ${bookingDetails.address ? `
                              <tr>
                                <td style="padding: 6px 0;">
                                  <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">
                                    <strong style="color: #333333;">Address:</strong> ${bookingDetails.address}
                                  </p>
                                </td>
                              </tr>
                              ` : ''}
                              <tr>
                                <td style="padding: 6px 0;">
                                  <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">
                                    <strong style="color: #333333;">Status:</strong> 
                                    <span style="color: ${statusTextColor}; font-weight: bold;">Cancelled</span>
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Information Message -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 25px;">
                        <tr>
                          <td style="background-color: #FFF5F5; padding: 18px 20px; border-radius: 6px; border-left: 4px solid #f44336;">
                            <p style="margin: 0; font-size: 14px; color: #333333; line-height: 1.6;">The booking has been cancelled by the customer. You can now accept other bookings for this time slot.</p>
                          </td>
                        </tr>
                      </table>

                      <!-- Contact Information -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #e0e0e0;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 10px 0; font-size: 13px; color: #666666; line-height: 1.6;">
                              For any queries or support, please contact us at:
                            </p>
                            <p style="margin: 0 0 5px 0; font-size: 13px; color: #333333; line-height: 1.6;">
                              <strong>Email:</strong> <a href="mailto:houseservicesup@gmail.com" style="color: #4caf50; text-decoration: none;">houseservicesup@gmail.com</a>
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 13px; color: #333333; line-height: 1.6;">
                              <strong>Phone:</strong> <a href="tel:+917009236647" style="color: #4caf50; text-decoration: none;">+91-70092-36647</a>
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Closing -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td>
                            <p style="margin: 20px 0 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                              Best Regards,<br/>
                              <strong style="color: #333333;">House Service Support Team</strong>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    
    console.log("✅ Booking cancellation email sent to employee:", info.messageId);
    console.log("   Employee Email:", employeeEmail);
  } catch (error) {
    console.error("❌ Error sending booking cancellation email to employee:", error.message);
    console.error("   Error Details:", {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    // Don't throw error - cancellation should still succeed even if email fails
  }
};





// exports.invoice = async (req, res) => {
//   try {
//     const { bookingId } = req.params;
//     const booking = await Booking.findById(bookingId)
//       .populate("employee", "name email address1 category speciality phone image")
//       .populate("customer", "name email address1 phone");

//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     // **Set headers to indicate a file download**
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="invoice_${bookingId}.pdf"`);

//     // **Create PDF Stream**
//     const doc = new PDFDocument({ margin: 50 });
//     doc.pipe(res); // Send PDF directly to response

//     // === HEADER WITH LOGO ===
    // const logoPath = path.join(__dirname, "../assets/logo.jpg"); // Ensure correct path
    // doc.image(logoPath, 50, 30, { width: 100 }).moveDown(1);
    // doc.font("Helvetica-Bold").fontSize(22).fillColor("#111827").text("INVOICE", { align: "center" }).moveDown(2);
    // doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#7d66d9").moveDown(1.5);

//     // === EMPLOYEE DETAILS ===
//     if (booking.employee) {
//       doc.fontSize(14).fillColor("#111827").text("From:", { align: "left" });
//       doc.fontSize(12).fillColor("#000000")
//         .text(`Name: ${booking.employee.name || "N/A"}`)
//         .text(`Email: ${booking.employee.email || "N/A"}`)
//         .text(`Phone: ${booking.employee.phone || "N/A"}`)
//         .text(`Category: ${booking.employee.category || "N/A"}`)
//         .text(`Speciality: ${booking.employee.speciality || "N/A"}`)
//         .text(`Address: ${booking.employee.address1 || "N/A"}`)
//         .moveDown(1);
//     } else {
//       doc.fontSize(14).fillColor("red").text("Employee details not found.");
//     }

//     // === CUSTOMER DETAILS ===
//     if (booking.customer) {
//       doc.fontSize(14).fillColor("#111827").text("Bill To:", { align: "left" });
//       doc.fontSize(12).fillColor("#000000")
//         .text(`Name: ${booking.customer.name || "N/A"}`)
//         .text(`Email: ${booking.customer.email || "N/A"}`)
//         .text(`Phone: ${booking.customer.phone || "N/A"}`)
//         .text(`Address: ${booking.customer.address1 || "N/A"}`)
//         .moveDown(1);
//     } else {
//       doc.fontSize(14).fillColor("red").text("Customer details not found.");
//     }

//     doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#5b5bd6").moveDown(1.5);

//     // === BOOKING DETAILS ===
//     doc.fontSize(14).fillColor("#111827").text("Booking Details:").moveDown(0.5);
//     doc.fontSize(12).fillColor("#000000")
//       .text(`Invoice Number: INV-${booking._id.toString().substring(0, 6).toUpperCase()}`)
//       .text(`Booking ID: ${booking._id}`)
//       .text(`Date: ${new Date(booking.date).toLocaleDateString()}`)
//       .text(`Time: ${booking.time}`)
//       .text(`Status: ${booking.status}`)
//       .text(`Address: ${booking.address}`)
//       .text(`Notes: ${booking.notes}`)
//       .moveDown(2);

//     doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#ffdd57").moveDown(1.5);
//     doc.fontSize(12).fillColor("#111827").text("Thank you for your business!", { align: "center" });

//     // **End PDF and close stream**
//     doc.end();
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     if (!res.headersSent) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// };



exports.invoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate("employee", "name email address1 category speciality phone image")
      .populate("customer", "name email address1 phone");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // **Set Headers for PDF Download**
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="HouseService_Invoice_${bookingId}.pdf"`);

    // **Create PDF Stream**
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // === HOUSE SERVICE HEADER ===
    const logoPath = path.join(__dirname, "../assets/logo.jpg"); // Ensure correct path
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 100 }).moveDown(1);
    }

    doc.fillColor("#7D66D9").font("Helvetica-Bold").fontSize(22).text("HOUSE SERVICE INVOICE", { align: "center" }).moveDown(0.5);
    doc.fillColor("#5B5BD6").fontSize(12).text("Reliable Home Repair & Maintenance Services", { align: "center" }).moveDown(1.5);
    
    // **Separator Line**
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#7D66D9").moveDown(1.5);

    // === SERVICE PROVIDER (EMPLOYEE) DETAILS ===
    if (booking.employee) {
      doc.fillColor("#111827").fontSize(14).text("Service Provider:", { underline: true }).moveDown(0.5);
      doc.fontSize(12)
        .text(`Name: ${booking.employee.name || "N/A"}`)
        .text(`Email: ${booking.employee.email || "N/A"}`)
        .text(`Phone: ${booking.employee.phone || "N/A"}`)
        .text(`Category: ${booking.employee.category || "N/A"}`)
        .text(`Speciality: ${booking.employee.speciality || "N/A"}`)
        .text(`Address: ${booking.employee.address1 || "N/A"}`)
        .moveDown(1);
    } else {
      doc.fillColor("red").fontSize(14).text("Service provider details not found.");
    }

    // === CUSTOMER DETAILS ===
    if (booking.customer) {
      doc.fillColor("#111827").fontSize(14).text("Customer Details:", { underline: true }).moveDown(0.5);
      doc.fontSize(12)
        .text(`Name: ${booking.customer.name || "N/A"}`)
        .text(`Email: ${booking.customer.email || "N/A"}`)
        .text(`Phone: ${booking.customer.phone || "N/A"}`)
        .text(`Address: ${booking.customer.address1 || "N/A"}`)
        .moveDown(1);
    } else {
      doc.fillColor("red").fontSize(14).text("Customer details not found.");
    }

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#5B5BD6").moveDown(1.5);

    // === BOOKING DETAILS ===
    doc.fillColor("#111827").fontSize(14).text("Booking Details:", { underline: true }).moveDown(0.5);
    doc.fontSize(12)
      .text(`Invoice Number: HS-${booking._id.toString().substring(0, 6).toUpperCase()}`)
      .text(`Booking ID: ${booking._id}`)
      .text(`Date: ${new Date(booking.date).toLocaleDateString()}`)
      .text(`Time: ${booking.time}`)
      .text(`Service Location: ${booking.address || "N/A"}`)
      .text(`Notes: ${booking.notes || "No additional notes"}`)
      .moveDown(2);

    // **Separator Line**
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#FFDD57").moveDown(1.5);

    // **FOOTER MESSAGE**
    doc.fillColor("#111827").fontSize(12).text("Thank you for choosing House Service!", { align: "center" }).moveDown(0.5);
    doc.fillColor("#5B5BD6").fontSize(10).text("For support, contact us at houseservicesup@gmail.com,+91-70092-36647", { align: "center" }).moveDown(2);

    // **End PDF**
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error generating invoice" });
    }
  }
};



// Create a booking
exports.createBooking = async (req, res) => {
  try {
    const { employee, customer, date, time, address, notes, rating } = req.body;

    // Validate required fields
    if (!employee || !customer || !date || !time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the employee exists
    const employeeExists = await Employee.findById(employee).select(
      "-password"
    ); // Exclude password
    if (!employeeExists)
      return res.status(404).json({ message: "Employee not found" });

    // Check if the customer exists
    const customerExists = await Customer.findById(customer);
    if (!customerExists)
      return res.status(404).json({ message: "Customer not found" });

    // Validate rating if provided
    if (rating?.value && (rating.value < 1 || rating.value > 5)) {
      return res
        .status(400)
        .json({ message: "Rating value must be between 1 and 5" });
    }

    // Check for booking conflicts - same employee, date, and time
    // Only check for active bookings (Pending or Accepted status)
    // Normalize the incoming date to start of day in UTC to match stored dates
    const bookingDate = new Date(date);
    const year = bookingDate.getUTCFullYear();
    const month = bookingDate.getUTCMonth();
    const day = bookingDate.getUTCDate();
    
    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    
    console.log(`[createBooking] Checking for conflicts: employee=${employee}, date=${date}, time=${time}`);
    console.log(`[createBooking] Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    
    const existingBooking = await Booking.findOne({
      employee: employee,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      time: time,
      status: { $in: ["Pending", "Accepted"] }
    });

    if (existingBooking) {
      console.log(`[createBooking] Conflict found: Existing booking at ${existingBooking.date} ${existingBooking.time}`);
      return res.status(409).json({ 
        message: "This time slot is already booked. Please choose another time.",
        conflict: true,
        existingBooking: {
          date: existingBooking.date,
          time: existingBooking.time,
          status: existingBooking.status
        }
      });
    }
    
    console.log(`[createBooking] No conflict found, proceeding with booking creation`);

    // Use the already normalized date (startOfDay) for storing the booking
    const normalizedDate = startOfDay;

    // Create a new booking
    const booking = new Booking({
      employee,
      customer,
      date: normalizedDate,
      time,
      address,
      notes,
      rating,
    });

    await booking.save();

    // Populate customer data for email
    const customerData = await Customer.findById(customer).select("name email phone");

    // Send email notification to employee
    if (employeeExists.email && customerData) {
      console.log(`[createBooking] Attempting to send email to employee: ${employeeExists.email}`);
      try {
        await sendBookingNotificationToEmployee(
          employeeExists.email,
          employeeExists.name,
          customerData.name,
          customerData.email,
          customerData.phone,
          {
            date: booking.date,
            time: booking.time,
            address: booking.address,
            notes: booking.notes,
          }
        );
      } catch (emailError) {
        console.error("[createBooking] Email sending failed, but booking was created:", emailError.message);
      }
    } else {
      console.warn(`[createBooking] Email not sent - missing employee email (${employeeExists.email}) or customer data (${customerData ? 'exists' : 'missing'})`);
    }

    res.status(201).json({
      message: "Booking created successfully",
      booking,
      employeeDetails: employeeExists,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bookings for a specific customer
exports.getCustomerBookings = async (req, res) => {
  try {
    const { customerId } = req.params;

    const bookings = await Booking.find({ customer: customerId })
      .populate(
        "employee",
        "name category speciality image address1 phone email rating"
      ) // Exclude password
      .sort({ date: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bookings for a specific employee
exports.getEmployeeBookings = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const bookings = await Booking.find({ employee: employeeId })
      .populate("customer", "name email address1 address2 image phone")
      .sort({ date: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate(
        "employee",
        "name email address1 category speciality phone image rating"
      ) // Exclude password
      .populate("customer", "name email image address1 phone rating");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
    .populate(
      "employee",
      "name category speciality rating address1 phone image"
    )
    .populate("customer", "name email image address1 phone") // Ensure 'image' is included here
    .sort({ date: -1 });
  

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update booking details
exports.updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updates = req.body;

    // Validate if there are any fields to update
    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No fields to update provided" });
    }

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update only the fields provided in the request body
    Object.keys(updates).forEach((key) => {
      booking[key] = updates[key];
    });

    // Save the updated booking
    await booking.save();

    // Populate related fields for the response
    const updatedBooking = await Booking.findById(bookingId)
      .populate(
        "employee",
        "name email address1 category speciality phone image rating"
      )
      .populate("customer", "name email address1 phone rating");

    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel a booking
// Example backend PATCH handler
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update status to "Cancelled"
    booking.status = "Cancelled";
    await booking.save(); // Save the updated booking

    // Populate employee and customer data for email notification
    const bookingWithDetails = await Booking.findById(bookingId)
      .populate("employee", "name email")
      .populate("customer", "name email");

    // IMPORTANT: When customer cancels, send email ONLY to employee, NOT to customer
    // The customer initiated the cancellation, so they don't need a confirmation email
    if (bookingWithDetails.employee && bookingWithDetails.employee.email && 
        bookingWithDetails.customer) {
      console.log(`[cancelBooking] Attempting to send cancellation email to employee: ${bookingWithDetails.employee.email}`);
      try {
        await sendBookingCancellationToEmployee(
          bookingWithDetails.employee.email,  // Send to EMPLOYEE email only
          bookingWithDetails.employee.name,
          bookingWithDetails.customer.name,
          bookingWithDetails.customer.email,  // Customer email is only for reference in email content
          {
            date: booking.date,
            time: booking.time,
            address: booking.address,
            notes: booking.notes,
          },
          booking._id
        );
      } catch (emailError) {
        console.error("[cancelBooking] Email sending failed, but booking was cancelled:", emailError.message);
      }
    } else {
      console.warn(`[cancelBooking] Email not sent - missing employee email (${bookingWithDetails.employee?.email}) or customer data`);
    }

    // Return the updated booking in the response
    res
      .status(200)
      .json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get booked time slots for an employee on a specific date
exports.getBookedSlots = async (req, res) => {
  try {
    const { employeeId, date } = req.query;

    if (!employeeId || !date) {
      return res.status(400).json({ 
        message: "Employee ID and date are required" 
      });
    }

    // Parse the date string (YYYY-MM-DD format) and create date range for the day
    // Use UTC to avoid timezone issues
    const dateParts = date.split('-');
    if (dateParts.length !== 3) {
      return res.status(400).json({ 
        message: "Invalid date format. Expected YYYY-MM-DD" 
      });
    }

    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[2], 10);

    // Create date range for the entire day in UTC
    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    // Find all bookings for this employee on this date with active status
    // Only include bookings that are Pending or Accepted (not Cancelled or Rejected)
    const bookings = await Booking.find({
      employee: employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ["Pending", "Accepted"] }
    }).select("time status date");

    console.log(`[getBookedSlots] Query params: employeeId=${employeeId}, date=${date}`);
    console.log(`[getBookedSlots] Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    console.log(`[getBookedSlots] Found ${bookings.length} bookings`);

    // Extract time slots (remove duplicates if any)
    const bookedSlotsMap = new Map();
    bookings.forEach(booking => {
      console.log(`[getBookedSlots] Booking found: time=${booking.time}, date=${booking.date}, status=${booking.status}`);
      if (!bookedSlotsMap.has(booking.time)) {
        bookedSlotsMap.set(booking.time, {
          time: booking.time,
          status: booking.status
        });
      }
    });

    const bookedSlots = Array.from(bookedSlotsMap.values());
    console.log(`[getBookedSlots] Returning ${bookedSlots.length} unique booked slots:`, bookedSlots);

    res.status(200).json({ 
      bookedSlots,
      date: date,
      count: bookedSlots.length
    });
  } catch (error) {
    console.error('Error in getBookedSlots:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    // Validate the status value
    const validStatuses = ["Pending", "Accepted", "Rejected", "Completed"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({
          message:
            "Invalid status value. Valid values are: Pending, Accepted, Rejected, Completed.",
        });
    }

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Get the old status before updating
    const oldStatus = booking.status;

    // Update the status
    booking.status = status;
    await booking.save(); // Save the updated booking

    // Populate employee and customer data for email
    const bookingWithDetails = await Booking.findById(bookingId)
      .populate("employee", "name email")
      .populate("customer", "name email");

    // Send email notification to customer when status changes
    if (bookingWithDetails.customer && bookingWithDetails.customer.email && 
        bookingWithDetails.employee && oldStatus !== status) {
      await sendBookingStatusUpdateToCustomer(
        bookingWithDetails.customer.email,
        bookingWithDetails.customer.name,
        bookingWithDetails.employee.name,
        {
          date: booking.date,
          time: booking.time,
          address: booking.address,
          notes: booking.notes,
        },
        status,
        booking._id
      );
    }

    // Return the updated booking in the response
    res
      .status(200)
      .json({ message: `Booking status updated to ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
