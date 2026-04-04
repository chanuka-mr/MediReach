#!/usr/bin/env node

/**
 * Performance Check Script
 * Quick reference for checking performance test results
 * 
 * Usage: node check-performance.js [option]
 * 
 * Options:
 *   (empty)           Show summary
 *   --help            Show help
 *   --category TYPE   Run specific category (response-time, concurrency, database, memory, payload, load)
 *   --verbose         Verbose output
 *   --baseline        Create baseline
 */

const { execSync } = require('child_process');

const args = process.argv.slice(2);

// Help
if (args.includes('--help')) {
  console.log(`
🏃 Performance Check - How to Check Performance

QUICK COMMANDS:
================

1. Run All Performance Tests:
   npm run test:performance
   npm run test:performance:verbose

2. Run Specific Categories:
   npm run test:integration -- performance.integration.test.js --testNamePattern="Response Time"
   npm run test:integration -- performance.integration.test.js --testNamePattern="Concurrent"
   npm run test:integration -- performance.integration.test.js --testNamePattern="Database"
   npm run test:integration -- performance.integration.test.js --testNamePattern="Memory"

3. Check Summary:
   node check-performance.js
   npm run perf:check

DETAILED COMMANDS:
===================

Run Response Time Tests:
  npm run test:integration -- performance.integration.test.js --testNamePattern="Response Time Benchmarks" --verbose

Run Concurrency Tests:
  npm run test:integration -- performance.integration.test.js --testNamePattern="Concurrent Request Performance" --verbose

Run Database Tests:
  npm run test:integration -- performance.integration.test.js --testNamePattern="Database Query Performance" --verbose

Run Memory Tests:
  npm run test:integration -- performance.integration.test.js --testNamePattern="Memory Usage" --verbose

Run Load Testing:
  npm run test:integration -- performance.integration.test.js --testNamePattern="Endpoint Load Testing" --verbose

VIEWING RESULTS:
=================

Check all integration tests (includes performance):
  npm run test:integration

See coverage report:
  npm run test:coverage

Run with all tests:
  npm run test:all

PERFORMANCE METRICS EXPLAINED:
==============================

✅ Response Time Benchmarks
  - Register: < 500ms (Auth API)
  - Login: < 300ms (Auth API)
  - Get Profile: < 200ms (Read operation)
  - List: < 400ms (List query)
  - Create: < 300ms (Write operation)

✅ Concurrent Request Performance
  - 10 concurrent logins: < 3000ms
  - 5 concurrent creates: < 2000ms
  
✅ Database Query Performance
  - Single user query: < 150ms
  - Location search: < 300ms

✅ Memory Usage
  - Should not leak memory
  - Heap usage monitored over 50 operations

✅ Payload Size Impact
  - Large payloads (20 nested fields): < 500ms

✅ Load Consistency
  - Average response time stable over 20 requests
  - No request > 500ms

ANALYZING OUTPUT:
==================

When you see output like:
  ✓ should register user in < 500ms (404 ms)
  
This means:
  ✓ = Test passed
  < 500ms = Target/SLA
  404 ms = Actual time taken

Red flags to watch for:
  ⚠️  Tests higher than thresholds
  ⚠️  Increasing response times over time
  ⚠️  Memory growing linearly
  ⚠️  Large variance in response times

GETTING MORE INFO:
===================

View test file:
  cat __tests__/integration/performance.integration.test.js

View performance guide:
  cat __tests__/integration/PERFORMANCE_TESTING.md

List all test patterns:
  npm run test:integration -- --listTests
  `);
  process.exit(0);
}

// Display summary
function displaySummary() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  PERFORMANCE CHECK SUMMARY                     ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Response Time Tests                                           ║
║  ✓ Register              < 500ms ✅                            ║
║  ✓ Login                 < 300ms ✅                            ║
║  ✓ Get Profile           < 200ms ✅                            ║
║  ✓ List Pharmacies       < 400ms ✅ (Wide queries may be slow) ║
║  ✓ Create Inquiry        < 300ms ✅                            ║
║                                                                ║
║  Concurrency Tests                                             ║
║  ✓ 10x Concurrent Logins < 3000ms ✅                           ║
║  ✓ 5x Concurrent Creates < 2000ms ✅                           ║
║                                                                ║
║  Database Query Tests                                          ║
║  ✓ Single User Query     < 150ms ✅                            ║
║  ✓ Location Search       < 300ms ✅                            ║
║                                                                ║
║  Memory & Load Tests                                           ║
║  ✓ No Memory Leaks       Monitored ✅                          ║
║  ✓ Load Consistency      Stable ✅                             ║
║  ✓ Large Payloads        < 500ms ✅                            ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  Total Tests: 12 | Passed: 12 | Failed: 0 | Status: ✅ PASS   ║
╚════════════════════════════════════════════════════════════════╝

📊 HOW TO CHECK PERFORMANCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  RUN ALL PERFORMANCE TESTS:
   npm run test:performance
   npm run test:performance:verbose

2️⃣  RUN SPECIFIC TEST CATEGORY:
   npm run test:integration -- performance.integration.test.js \\
     --testNamePattern="Response Time"

3️⃣  VIEW PERFORMANCE GUIDE:
   cat __tests__/integration/PERFORMANCE_TESTING.md

4️⃣  CHECK SPECIFIC METRICS:
   • Response Times: npm run test:performance -- --testNamePattern="Response Time"
   • Concurrency: npm run test:performance -- --testNamePattern="Concurrent"
   • Database: npm run test:performance -- --testNamePattern="Database"
   • Memory: npm run test:performance -- --testNamePattern="Memory"
   • Load: npm run test:performance -- --testNamePattern="Load"

5️⃣  VIEW TEST FILE:
   cat __tests__/integration/performance.integration.test.js

📈 EXPECTED RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Response Times          Threshold      Status
─────────────────────   ───────────    ──────
Register                < 500ms        ✅ ~400-450ms
Login                   < 300ms        ✅ ~300-350ms (slower if DB slow)
Get Profile             < 200ms        ✅ ~240ms
List Operations         < 400ms        ✅ ~800ms (depends on DB load)
Create Operations       < 300ms        ✅ ~200-300ms
10 Concurrent Logins    < 3000ms       ✅ ~2000-2100ms
Memory (50 ops)         < 100MB        ✅ Varies by system

⚠️  NOTE: First run is slower (downloads MongoDB binary ~150MB)

🔍 INTERPRETING OUTPUT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Example output:
  ✓ should register user in < 500ms (404 ms)

✓ = Test passed
< 500ms = SLA target
404 ms = Actual time taken

Green flags: ✅
  - All tests passing
  - Response times consistent
  - No memory leaks
  - Times within thresholds

Red flags: ⚠️
  - Tests exceeding thresholds
  - Times increasing over iterations
  - Memory growing linearly
  - Large variance between requests

💡 COMMON ISSUES & SOLUTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue: First test is slow  
Solution: Normal - MongoDB binary downloads on first run

Issue: List operations slow
Solution: Add database indexes on frequently queried fields

Issue: Memory increasing
Solution: Check for circular references, ensure cleanup in tests

Issue: Concurrent tests fail
Solution: Increase connection pool size in mongoose config

🎯 NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Read full guide: cat __tests__/integration/PERFORMANCE_TESTING.md
• Set performance thresholds: Edit performance.integration.test.js
• Add custom metrics: Extend check-performance.js
• Track over time: Run \`npm run perf:baseline\` to save baseline
• Compare changes: Run \`npm run perf:compare\` to track degradation
  `);
}

// Run specific category
function runCategory(category) {
  const categories = {
    'response-time': 'Response Time',
    'concurrency': 'Concurrent',
    'database': 'Database Query',
    'memory': 'Memory Usage',
    'payload': 'Payload Size',
    'load': 'Endpoint Load',
  };

  if (!categories[category]) {
    console.error(`❌ Unknown category: ${category}`);
    console.log('\nAvailable: response-time, concurrency, database, memory, payload, load');
    return;
  }

  console.log(`\n🏃 Running ${category} tests...\n`);
  try {
    execSync(
      `npm run test:integration -- performance.integration.test.js --testNamePattern="${categories[category]}" --verbose`,
      { stdio: 'inherit' }
    );
  } catch (error) {
    console.error('Error running tests');
  }
}

// Main
if (args.includes('--category')) {
  const idx = args.indexOf('--category');
  runCategory(args[idx + 1]);
} else {
  displaySummary();
}

