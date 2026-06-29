import { sendEmail } from "../utils/email"

export const sendEmail = async ({ to, subject, body }: {
  to: string;
  subject: string;
  body: string;
}) => {
  // Implementation would use a mail service like Nodemailer or SendGrid
  console.log(`Sending email to: ${to}`)
  console.log(`Subject: ${subject}`)
  console.log(`Body: ${body}`)
  // Actual email sending logic would go here
}

// Example usage:
// await sendEmail({
//   to: "user@example.com",
//   subject: "Order Status Update",
//   body: "Your order has been shipped"
// })