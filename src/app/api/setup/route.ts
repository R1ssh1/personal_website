import { NextResponse } from 'next/server'
import { adminUsersDb, certificationsDb } from '@/lib/database-unified'
import { hashPassword } from '@/lib/auth'

const sampleCertifications = [
  {
    title: 'AWS Certified Solutions Architect - Associate',
    issuer: 'Amazon Web Services',
    issueDate: '2024-01-15',
    expirationDate: '2027-01-15',
    verificationLink: 'https://aws.amazon.com/verification/12345',
    description: 'Demonstrated expertise in designing and deploying scalable, highly available, and fault-tolerant systems on AWS. Covered EC2, S3, RDS, VPC, and other core AWS services with best practices for security and cost optimization.',
    tags: ['AWS', 'Cloud Architecture', 'DevOps', 'Infrastructure'],
    imageUrl: 'https://images.credly.com/size/680x680/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png'
  },
  {
    title: 'Google Cloud Professional Cloud Architect',
    issuer: 'Google Cloud',
    issueDate: '2024-03-10',
    expirationDate: '2026-03-10',
    verificationLink: 'https://cloud.google.com/certification/verify/67890',
    description: 'Validated skills in designing, developing, and managing robust, secure, scalable, and highly available solutions on Google Cloud Platform. Expertise in cloud solution architecture, infrastructure design, and system integration.',
    tags: ['Google Cloud', 'GCP', 'Cloud Architecture', 'Kubernetes'],
    imageUrl: 'https://images.credly.com/size/680x680/images/5420d977-1a2c-4700-aaeb-5bf151c6e5ca/image.png'
  },
  {
    title: 'Microsoft Certified: Azure Developer Associate',
    issuer: 'Microsoft',
    issueDate: '2023-09-20',
    expirationDate: '2025-09-20',
    verificationLink: 'https://learn.microsoft.com/api/credentials/share/verification/54321',
    description: 'Demonstrated proficiency in developing cloud applications and services on Microsoft Azure. Covered Azure compute solutions, storage, security, monitoring, and integration with third-party services.',
    tags: ['Azure', 'Cloud Development', '.NET', 'API Development'],
    imageUrl: 'https://images.credly.com/size/680x680/images/63316b10-f1aa-4a78-8d47-b883b16a2f7a/image.png'
  },
  {
    title: 'Certified Kubernetes Administrator (CKA)',
    issuer: 'Cloud Native Computing Foundation',
    issueDate: '2024-02-05',
    expirationDate: '2027-02-05',
    verificationLink: 'https://cncf.io/certification/verify/98765',
    description: 'Validated skills in Kubernetes cluster administration including installation, configuration, networking, storage, security, troubleshooting, and maintenance. Hands-on experience with container orchestration at scale.',
    tags: ['Kubernetes', 'Container Orchestration', 'DevOps', 'CNCF'],
    imageUrl: 'https://images.credly.com/size/680x680/images/8b8ed108-e77d-4396-ac59-2504583b9d54/cka_from_cncfsite__281_29.png'
  },
  {
    title: 'MongoDB Certified Developer',
    issuer: 'MongoDB Inc.',
    issueDate: '2023-11-12',
    description: 'Demonstrated expertise in MongoDB database development including data modeling, indexing, aggregation framework, and performance optimization. Proficient in building applications with MongoDB as the primary database.',
    tags: ['MongoDB', 'NoSQL', 'Database', 'Backend Development'],
    imageUrl: 'https://images.credly.com/size/680x680/images/e5b88b9f-c19d-4a5b-ab3b-fc8a76432b4f/image.png'
  }
]

export async function POST() {
  try {
    console.log('Setting up admin user and sample data...')

    // Setup admin user
    const username = process.env.ADMIN_USERNAME || 'admin'
    const password = process.env.ADMIN_PASSWORD || 'portfolio123'

    // Initialize database tables if using PostgreSQL
    if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
      const { initializeDatabasePostgres } = await import('@/lib/database-postgres')
      await initializeDatabasePostgres()
    }

    const existingUser = await adminUsersDb.getByUsername(username)

    let adminResult = 'Admin user already exists'
    if (!existingUser) {
      const passwordHash = await hashPassword(password)
      const userId = adminUsersDb.create(username, passwordHash)
      adminResult = `Admin user created with ID: ${userId}`
    }

    // Setup sample certifications - clear existing and start fresh
    // certificationsDb.deleteAll() // Clear all existing certifications
    let certResult = 'Ready for certifications (existing data preserved)'

    // Don't add sample certifications anymore - user will upload their own
    // if (existingCerts.length === 0) {
    //   for (const cert of sampleCertifications) {
    //     certificationsDb.create(cert)
    //   }
    //   certResult = `Created ${sampleCertifications.length} sample certifications`
    // }

    return NextResponse.json({
      message: 'Setup completed successfully',
      admin: adminResult,
      certifications: certResult,
      loginUrl: '/admin',
      credentials: {
        username,
        password: '***' // Don't show actual password in response
      }
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Setup failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST()
}