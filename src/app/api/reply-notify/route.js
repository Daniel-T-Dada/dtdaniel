import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { ADMIN_EMAIL } from "@/lib/firebase";

export async function POST(request) {
    try {
        const { messageId, reply, recipientEmail, recipientName } = await request.json();

        // Validate required fields
        if (!reply || !recipientEmail || !recipientName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create transporter with proper error handling
        let transporter;
        try {
            transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: ADMIN_EMAIL,
                    pass: process.env.EMAIL_APP_PASSWORD,
                },
            });
        } catch (error) {
            console.error("Error creating email transporter:", error);
            return NextResponse.json(
                { error: "Email configuration error" },
                { status: 500 }
            );
        }

        // Verify transporter configuration
        try {
            await transporter.verify();
        } catch (error) {
            console.error("Email transporter verification failed:", error);
            return NextResponse.json(
                { error: "Email service not available" },
                { status: 500 }
            );
        }

        // Email template
        const mailOptions = {
            from: ADMIN_EMAIL,
            to: recipientEmail,
            subject: `📬 Reply to Your Message - Double D`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">📨 Reply to Your Message</h2>
                <div style="padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px; margin: 20px 0;">
                    <p>Hello ${recipientName},</p>
                    <p>Thank you for your message. I have replied to your inquiry:</p>
                    <div style="padding: 15px; background-color: #F9FAFB; border-radius: 6px; margin: 10px 0;">
                        ${reply}
                    </div>
                    <p style="margin-top: 20px;">If you have any further questions, feel free to reply to this email or send a new message through the contact form.</p>
                </div>
                <p style="color: #6B7280; font-size: 0.875rem;">
                    Best regards,<br>
                    For Cafria Tech Hub<br>
                    Daniel Titobiloluwa Dada
                </p>
            </div>
            `,
        };

        // Send email with proper error handling
        try {
            await transporter.sendMail(mailOptions);
            return NextResponse.json({ success: true });
        } catch (error) {
            console.error("Error sending email:", error);
            return NextResponse.json(
                { error: "Failed to send email", details: error.message },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Reply notification error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
} 