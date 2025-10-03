const { certificationsDb } = require('../src/lib/database')

const sampleCertifications = [
  {
    title: 'AWS Certified Solutions Architect - Associate',
    issuer: 'Amazon Web Services',
    issueDate: '2024-01-15',
    expirationDate: '2027-01-15',
    verificationLink: 'https://aws.amazon.com/verification/12345',
    description: 'Demonstrated expertise in designing and deploying scalable, highly available, and fault-tolerant systems on AWS. Covered EC2, S3, RDS, VPC, and other core AWS services with best practices for security and cost optimization.',
    tags: ['AWS', 'Cloud Architecture', 'DevOps', 'Infrastructure'],
    imageUrl: '/certificates/aws-solutions-architect.jpg'
  },
  {
    title: 'Google Cloud Professional Cloud Architect',
    issuer: 'Google Cloud',
    issueDate: '2024-03-10',
    expirationDate: '2026-03-10',
    verificationLink: 'https://cloud.google.com/certification/verify/67890',
    description: 'Validated skills in designing, developing, and managing robust, secure, scalable, and highly available solutions on Google Cloud Platform. Expertise in cloud solution architecture, infrastructure design, and system integration.',
    tags: ['Google Cloud', 'GCP', 'Cloud Architecture', 'Kubernetes'],
    imageUrl: '/certificates/gcp-architect.jpg'
  },
  {
    title: 'Microsoft Certified: Azure Developer Associate',
    issuer: 'Microsoft',
    issueDate: '2023-09-20',
    expirationDate: '2025-09-20',
    verificationLink: 'https://learn.microsoft.com/api/credentials/share/verification/54321',
    description: 'Demonstrated proficiency in developing cloud applications and services on Microsoft Azure. Covered Azure compute solutions, storage, security, monitoring, and integration with third-party services.',
    tags: ['Azure', 'Cloud Development', '.NET', 'API Development'],
    imageUrl: '/certificates/azure-developer.jpg'
  },
  {
    title: 'Certified Kubernetes Administrator (CKA)',
    issuer: 'Cloud Native Computing Foundation',
    issueDate: '2024-02-05',
    expirationDate: '2027-02-05',
    verificationLink: 'https://cncf.io/certification/verify/98765',
    description: 'Validated skills in Kubernetes cluster administration including installation, configuration, networking, storage, security, troubleshooting, and maintenance. Hands-on experience with container orchestration at scale.',
    tags: ['Kubernetes', 'Container Orchestration', 'DevOps', 'CNCF'],
    imageUrl: '/certificates/cka.jpg'
  },
  {
    title: 'MongoDB Certified Developer',
    issuer: 'MongoDB Inc.',
    issueDate: '2023-11-12',
    description: 'Demonstrated expertise in MongoDB database development including data modeling, indexing, aggregation framework, and performance optimization. Proficient in building applications with MongoDB as the primary database.',
    tags: ['MongoDB', 'NoSQL', 'Database', 'Backend Development'],
    imageUrl: '/certificates/mongodb-developer.jpg'
  }
]

async function seedCertifications() {
  console.log('Seeding sample certifications...')

  for (const cert of sampleCertifications) {
    const id = certificationsDb.create(cert)
    console.log(`Created certification: ${cert.title} (ID: ${id})`)
  }

  console.log('Sample certifications created successfully!')
}

seedCertifications().catch(console.error)