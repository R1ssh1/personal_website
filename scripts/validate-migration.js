/**
 * Database Migration Validator
 * 
 * Tests database connectivity and CRUD operations after migration.
 * Use this to validate SQLite → PostgreSQL migrations.
 * 
 * Usage: node scripts/validate-migration.js
 */

const { 
  certificationsDb, 
  projectsDb, 
  blogPostsDb,
  adminUsersDb,
  adminSessionsDb 
} = require('../src/lib/database-unified')

/**
 * Test database reads
 */
async function testReads() {
  console.log('📖 Testing database reads...')
  
  try {
    const certs = await certificationsDb.getAll()
    console.log(`  ✅ Certifications: ${certs.length} records`)
    
    const projects = await projectsDb.getAll()
    console.log(`  ✅ Projects: ${projects.length} records`)
    
    const posts = await blogPostsDb.getAll()
    console.log(`  ✅ Blog Posts: ${posts.length} records`)
    
    const users = await adminUsersDb.getById('test-id') // Will return null but tests connection
    console.log(`  ✅ Admin Users: Table accessible`)
    
    return true
  } catch (error) {
    console.error(`  ❌ Read test failed:`, error.message)
    return false
  }
}

/**
 * Test database writes (create)
 */
async function testCreate() {
  console.log('\n✍️  Testing database writes...')
  
  try {
    // Create test certification
    const testId = await certificationsDb.create({
      title: 'Migration Test Certification',
      issuer: 'Test Issuer',
      issueDate: new Date().toISOString(),
      description: 'This is a test entry created during migration validation',
      tags: ['test', 'migration', 'validation'],
      imageUrl: 'https://example.com/test-image.jpg'
    })
    
    console.log(`  ✅ Created test certification: ${testId}`)
    
    // Verify it was created
    const created = await certificationsDb.getById(testId)
    if (!created) {
      throw new Error('Created certification not found')
    }
    
    console.log(`  ✅ Verified creation: Found certification`)
    
    // Test array field parsing
    if (!Array.isArray(created.tags)) {
      throw new Error('Tags field is not an array - JSON parsing issue')
    }
    console.log(`  ✅ Array fields parse correctly: ${created.tags.join(', ')}`)
    
    return testId
  } catch (error) {
    console.error(`  ❌ Write test failed:`, error.message)
    return null
  }
}

/**
 * Test database updates
 */
async function testUpdate(id) {
  console.log('\n🔄 Testing database updates...')
  
  try {
    const updated = await certificationsDb.update(id, {
      title: 'Updated Test Certification',
      tags: ['updated', 'test']
    })
    
    if (!updated) {
      throw new Error('Update operation returned false')
    }
    
    console.log(`  ✅ Updated test certification`)
    
    // Verify update
    const cert = await certificationsDb.getById(id)
    if (cert.title !== 'Updated Test Certification') {
      throw new Error('Update not reflected in database')
    }
    
    console.log(`  ✅ Verified update: Title changed`)
    
    return true
  } catch (error) {
    console.error(`  ❌ Update test failed:`, error.message)
    return false
  }
}

/**
 * Test database deletes (cleanup)
 */
async function testDelete(id) {
  console.log('\n🗑️  Testing database deletes...')
  
  try {
    const deleted = await certificationsDb.delete(id)
    
    if (!deleted) {
      throw new Error('Delete operation returned false')
    }
    
    console.log(`  ✅ Deleted test certification`)
    
    // Verify deletion
    const cert = await certificationsDb.getById(id)
    if (cert !== null) {
      throw new Error('Deleted certification still exists')
    }
    
    console.log(`  ✅ Verified deletion: Record removed`)
    
    return true
  } catch (error) {
    console.error(`  ❌ Delete test failed:`, error.message)
    return false
  }
}

/**
 * Test data integrity
 */
async function testDataIntegrity() {
  console.log('\n🔍 Testing data integrity...')
  
  try {
    // Check for certifications with proper structure
    const certs = await certificationsDb.getAll()
    
    if (certs.length > 0) {
      const sample = certs[0]
      
      // Required fields
      const requiredFields = ['id', 'title', 'issuer', 'issueDate', 'description', 'tags', 'imageUrl']
      const missing = requiredFields.filter(field => !sample[field])
      
      if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`)
      }
      
      console.log(`  ✅ Required fields present`)
      
      // Array fields should be arrays
      if (!Array.isArray(sample.tags)) {
        throw new Error('Tags field is not an array')
      }
      
      console.log(`  ✅ Array fields properly parsed`)
      
      // Date fields should be valid
      if (isNaN(Date.parse(sample.issueDate))) {
        throw new Error('Invalid date format')
      }
      
      console.log(`  ✅ Date fields valid`)
    } else {
      console.log(`  ℹ️  No certifications to validate (empty table)`)
    }
    
    return true
  } catch (error) {
    console.error(`  ❌ Integrity test failed:`, error.message)
    return false
  }
}

/**
 * Main validation function
 */
async function validateMigration() {
  console.log('🚀 Starting database migration validation...\n')
  console.log('='.repeat(50))
  
  const results = {
    reads: false,
    create: false,
    update: false,
    delete: false,
    integrity: false
  }
  
  let testId = null
  
  // Run tests in sequence
  results.reads = await testReads()
  
  if (results.reads) {
    testId = await testCreate()
    results.create = testId !== null
  }
  
  if (results.create && testId) {
    results.update = await testUpdate(testId)
    results.integrity = await testDataIntegrity()
    results.delete = await testDelete(testId)
  }
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 VALIDATION SUMMARY')
  console.log('='.repeat(50))
  
  console.log(`Read operations:      ${results.reads ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Create operations:    ${results.create ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Update operations:    ${results.update ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Delete operations:    ${results.delete ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Data integrity:       ${results.integrity ? '✅ PASS' : '❌ FAIL'}`)
  
  const allPassed = Object.values(results).every(r => r === true)
  
  if (allPassed) {
    console.log('\n✨ Migration validation successful!')
    console.log('Your database is ready for production use.')
    process.exit(0)
  } else {
    console.log('\n❌ Migration validation failed!')
    console.log('Please review errors above and fix issues.')
    process.exit(1)
  }
}

// Run validation
validateMigration().catch(error => {
  console.error('\n💥 Unexpected error:', error)
  process.exit(1)
})
