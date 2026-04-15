import { Resend } from 'resend'
import { ComplaintStatus } from '@prisma/client'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ASSIGNED: 'Assigned to Artisan',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
}

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  SUBMITTED: '#6B7280',
  UNDER_REVIEW: '#F59E0B',
  ASSIGNED: '#3B82F6',
  IN_PROGRESS: '#F97316',
  RESOLVED: '#10B981',
}

interface ComplaintEmailData {
  complaintId: string
  title: string
  block: string
  roomNumber: string
  category: string
  studentName?: string
  studentEmail?: string
  status?: ComplaintStatus
}

/**
 * Notify admin when a new complaint is submitted
 */
export async function sendAdminNewComplaintEmail(
  data: ComplaintEmailData
): Promise<void> {
  if (!resend || !process.env.ADMIN_EMAIL) return

  try {
    await resend.emails.send({
      from: 'RUN Hostel Portal <complaints@run.edu.ng>',
      to: process.env.ADMIN_EMAIL,
      subject: `New Complaint Submitted — ${data.complaintId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0D1F3C; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Hostel Complaint</h1>
            <p style="color: #9CA3AF; margin: 4px 0 0; font-size: 14px;">Redeemer's University — Hostel Portal</p>
          </div>
          <div style="background: #F9FAFB; padding: 24px; border: 1px solid #E5E7EB; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px; width: 140px;">Complaint ID</td><td style="padding: 8px 0; font-weight: bold; color: #0D1F3C;">${data.complaintId}</td></tr>
              <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">Title</td><td style="padding: 8px 0;">${data.title}</td></tr>
              <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">Student</td><td style="padding: 8px 0;">${data.studentName || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">Block / Room</td><td style="padding: 8px 0;">Block ${data.block}, Room ${data.roomNumber}</td></tr>
              <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">Category</td><td style="padding: 8px 0;">${data.category}</td></tr>
            </table>
            <div style="margin-top: 20px;">
              <a href="${process.env.NEXTAUTH_URL}/admin/complaints" style="background: #0D1F3C; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">View in Admin Portal →</a>
            </div>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('[Email] Failed to send admin notification:', err)
  }
}

/**
 * Notify student when their complaint status changes
 */
export async function sendStudentStatusUpdateEmail(
  data: ComplaintEmailData & { status: ComplaintStatus }
): Promise<void> {
  if (!resend || !data.studentEmail) return

  const statusLabel = STATUS_LABELS[data.status]
  const statusColor = STATUS_COLORS[data.status]

  try {
    await resend.emails.send({
      from: 'RUN Hostel Portal <complaints@run.edu.ng>',
      to: data.studentEmail,
      subject: `Complaint Update — ${data.complaintId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0D1F3C; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Complaint Status Update</h1>
            <p style="color: #9CA3AF; margin: 4px 0 0; font-size: 14px;">Redeemer's University — Hostel Portal</p>
          </div>
          <div style="background: #F9FAFB; padding: 24px; border: 1px solid #E5E7EB; border-radius: 0 0 8px 8px;">
            <p style="color: #374151;">Hi ${data.studentName || 'Student'}, your complaint has been updated.</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px; width: 140px;">Complaint ID</td><td style="padding: 8px 0; font-weight: bold; color: #0D1F3C;">${data.complaintId}</td></tr>
              <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">Title</td><td style="padding: 8px 0;">${data.title}</td></tr>
              <tr><td style="padding: 8px 0; color: #6B7280; font-size: 13px;">New Status</td><td style="padding: 8px 0;"><span style="background: ${statusColor}20; color: ${statusColor}; padding: 2px 10px; border-radius: 999px; font-size: 13px; font-weight: 600;">${statusLabel}</span></td></tr>
            </table>
            <div style="margin-top: 20px;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/complaints" style="background: #0D1F3C; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">Track Your Complaint →</a>
            </div>
          </div>
        </div>
      `,
    })
  } catch (err) {
    console.error('[Email] Failed to send student notification:', err)
  }
}
