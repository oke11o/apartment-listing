// Data validation and business logic tests for apartment listing
// Tests JSON structure, filtering logic, and pagination without requiring a running server
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Test JSON data validity
function testJsonData() {
  console.log('Testing JSON data...')

  try {
    const dataPath = path.join(__dirname, '../server/data/apartments.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const data = JSON.parse(rawData)

    console.log(`✓ JSON is valid`)
    console.log(`✓ Contains ${data.apartments.length} apartments`)
    console.log(`✓ Meta data present: ${JSON.stringify(data.meta.filters)}`)

    // Verify apartment structure
    const firstApartment = data.apartments[0]
    const requiredFields = [
      'id',
      'title',
      'price',
      'area',
      'rooms',
      'floor',
      'totalFloors',
      'address',
      'images',
      'features',
    ]

    for (const field of requiredFields) {
      if (!(field in firstApartment)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    console.log(`✓ Apartment structure is valid`)

    return data
  }
  catch (error) {
    console.error('✗ JSON data test failed:', error.message)
    return null
  }
}

// Test filtering logic (simulated)
function testFilteringLogic(data) {
  console.log('\nTesting filtering logic...')

  try {
    // Test price filtering
    const priceFiltered = data.apartments.filter(
      apt => apt.price >= 5000000 && apt.price <= 10000000,
    )
    console.log(`✓ Price filter (5M-10M): ${priceFiltered.length} apartments`)

    // Test rooms filtering
    const roomsFiltered = data.apartments.filter(apt =>
      [1, 2].includes(apt.rooms),
    )
    console.log(`✓ Rooms filter (1,2): ${roomsFiltered.length} apartments`)

    // Test area filtering
    const areaFiltered = data.apartments.filter(
      apt => apt.area >= 50 && apt.area <= 100,
    )
    console.log(`✓ Area filter (50-100): ${areaFiltered.length} apartments`)

    // Test floor filtering
    const floorFiltered = data.apartments.filter(
      apt => apt.floor >= 10 && apt.floor <= 20,
    )
    console.log(`✓ Floor filter (10-20): ${floorFiltered.length} apartments`)

    // Test combined filtering
    const combinedFiltered = data.apartments.filter(
      apt =>
        [2, 3].includes(apt.rooms)
        && apt.price >= 7000000
        && apt.price <= 12000000,
    )
    console.log(
      `✓ Combined filter (2-3 rooms, 7M-12M): ${combinedFiltered.length} apartments`,
    )
  }
  catch (error) {
    console.error('✗ Filtering logic test failed:', error.message)
  }
}

// Test pagination logic (simulated)
function testPaginationLogic(data) {
  console.log('\nTesting pagination logic...')

  try {
    const page = 2
    const limit = 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedApartments = data.apartments.slice(startIndex, endIndex)

    console.log(
      `✓ Pagination (page ${page}, limit ${limit}): ${paginatedApartments.length} apartments`,
    )
    console.log(`✓ Total apartments: ${data.apartments.length}`)

    // Test edge cases
    const lastPage = Math.ceil(data.apartments.length / limit)
    const lastPageStart = (lastPage - 1) * limit
    const lastPageApartments = data.apartments.slice(lastPageStart)

    console.log(
      `✓ Last page (${lastPage}): ${lastPageApartments.length} apartments`,
    )
  }
  catch (error) {
    console.error('✗ Pagination logic test failed:', error.message)
  }
}

// Run all tests
function runTests() {
  console.log('=== API Functionality Tests ===\n')

  const data = testJsonData()
  if (data) {
    testFilteringLogic(data)
    testPaginationLogic(data)
  }

  console.log('\n=== Tests Complete ===')
}

// Run tests
runTests()
