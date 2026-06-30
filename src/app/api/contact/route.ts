import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { contactSubmissionsDb } from '@/lib/database-unified'

const contactFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    subject: z.string().min(1, 'Subject is required').max(200),
    message: z.string().min(10, 'Message must be at least 10 characters').max(5000)
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate the input
        const validatedData = contactFormSchema.parse(body)

        // Store the contact submission in the database
        const id = await contactSubmissionsDb.create({
            name: validatedData.name,
            email: validatedData.email,
            subject: validatedData.subject,
            message: validatedData.message
        })

        return NextResponse.json(
            { success: true, message: 'Message sent successfully', id },
            { status: 201 }
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        console.error('Contact form submission error:', error)
        return NextResponse.json(
            { error: 'Failed to send message. Please try again later.' },
            { status: 500 }
        )
    }
}
