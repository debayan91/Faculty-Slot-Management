import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function POST(request: NextRequest) {
  try {
    const resendClient = getResend();

    if (!resendClient) {
      console.log('Email skipped: RESEND_API_KEY not configured');
      return NextResponse.json({ success: true, skipped: true, reason: 'Email not configured' });
    }

    const { to, userName, slotDate, slotTime, courseName, roomNumber } = await request.json();

    if (!to || !slotDate || !slotTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resendClient.emails.send({
      from: 'SCOPE Research Portal <noreply@resend.dev>',
      to: [to],
      subject: 'Booking Confirmation - SCOPE Research Portal',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; padding: 40px 20px; }
              .container { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; padding: 32px; }
              h1 { font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 8px 0; }
              p { color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; }
              .detail { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
              .label { color: #6b7280; font-size: 14px; }
              .value { color: #111827; font-weight: 500; font-size: 14px; }
              .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Booking Confirmed! ✓</h1>
              <p>Hi ${userName || 'there'}, your slot has been successfully booked.</p>
              
              <div class="detail">
                <span class="label">Date</span>
                <span class="value">${slotDate}</span>
              </div>
              <div class="detail">
                <span class="label">Time</span>
                <span class="value">${slotTime}</span>
              </div>
              <div class="detail">
                <span class="label">Course</span>
                <span class="value">${courseName || 'Meeting Session'}</span>
              </div>
              ${
                roomNumber
                  ? `
              <div class="detail">
                <span class="label">Room</span>
                <span class="value">${roomNumber}</span>
              </div>
              `
                  : ''
              }
              
              <div class="footer">
                <p>SCOPE Research Portal • VIT Business School</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error: any) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
