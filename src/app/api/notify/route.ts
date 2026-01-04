import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { ADMIN_EMAIL } from "@/lib/firebase";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { name, email, subject, message } = data;

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: ADMIN_EMAIL,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        });

        // Email content
        const mailOptions = {
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            subject: `New Contact Form Message: ${subject}`,
            html: `
        <h2>New Message from Portfolio Contact Form</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Message:</h3>
        <p>${message}</p>
        <hr>
        <p>You can view this message in your <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin">admin panel</a>.</p>
      `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json(
            { error: "Failed to send notification" },
            { status: 500 }
        );
    }
}
