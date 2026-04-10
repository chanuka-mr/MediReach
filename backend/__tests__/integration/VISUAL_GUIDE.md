# 🎯 Integration Testing - Visual Flow Guide

## How Your Tests Work - Step by Step

```
┌─────────────────────────────────────────────────────────────────┐
│                     TEST FILE LIFECYCLE                          │
└─────────────────────────────────────────────────────────────────┘

1️⃣ TEST STARTS
   ↓
   beforeAll() ← Runs ONCE before all tests in file
   ├─ startDB() → Start in-memory MongoDB
   ├─ require app → Load Express server
   └─ Wait 100ms → Let models register


2️⃣ FOR EACH TEST
   ↓
   beforeEach() ← Runs BEFORE every single test
   ├─ clearDB() → Delete all data from database
   ├─ Create test user (optional)
   └─ Get auth token (optional)
   
   ↓
   
   TEST CODE RUNS ← Your actual test
   ├─ Make HTTP request
   ├─ Check response
   └─ Run assertions
   
   ↓
   
   afterEach() ← (optional) Cleanup after test


3️⃣ ALL TESTS DONE
   ↓
   afterAll() ← Runs ONCE after all tests
   ├─ stopDB() → Stop MongoDB
   └─ Disconnect → Close connections


Result: All data is cleaned, no test affects another! ✨
```

---

## HTTP Request Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│              HOW TO MAKE AN HTTP REQUEST IN A TEST               │
└─────────────────────────────────────────────────────────────────┘

const response = await request(app)
                        ↑
                    Express app
                      
                .post('/api/endpoint')
                 ↑
              HTTP method (get, post, put, delete)
              
                .set('Authorization', `Bearer ${token}`)
                 ↑
              Optional: Add headers (auth, content-type, etc)
              
                .send({ name: 'Test', email: 'test@example.com' })
                 ↑
              Optional: Send request body (JSON data)
              
                .expect(201);
                 ↑
              Assert: Expect HTTP status code

// Now check the response
expect(response.body.status).toBe('success');
expect(response.body.data.user).toBeDefined();
```

---

## File Organization

```
────────────────────────────────────────────────────────────────

backend/
│
├── __tests__/
│   │
│   ├── integration/  ← YOUR TESTS ARE HERE! 🎯
│   │   │
│   │   ├── ✅ setup.js
│   │   │   ├─ startDB() - Start test database
│   │   │   ├─ stopDB() - Stop test database
│   │   │   └─ clearDB() - Clear all collections
│   │   │
│   │   ├── ✅ testUtils.js
│   │   │   ├─ createTestUser()
│   │   │   ├─ createTestPharmacy()
│   │   │   ├─ createTestOrder()
│   │   │   └─ createTestInquiry()
│   │   │
│   │   ├── ✅ httpTestHelpers.js
│   │   │   ├─ registerAndLogin()
│   │   │   ├─ testCreate(), testGet(), testDelete()
│   │   │   └─ Assertion helpers
│   │   │
│   │   ├── 📖 Example Tests
│   │   │   ├─ auth.integration.test.js
│   │   │   ├─ orders.integration.test.js
│   │   │   └─ pharmacy.integration.test.js
│   │   │
│   │   ├── 📖 Documentation
│   │   │   ├─ GETTING_STARTED.md ← START HERE!
│   │   │   ├─ PRACTICAL_GUIDE.md (real examples)
│   │   │   ├─ HOW_TO_TEST.md (full guide)
│   │   │   ├─ QUICK_REFERENCE.md (quick lookup)
│   │   │   └─ README.md (complete reference)
│   │   │
│   │   └── 🚀 run-tests.sh (quick commands)
│   │
│   └── controllers/ ← Existing unit tests
│
├── app.js ← Express server
├── package.json ← Test scripts: npm run test:integration
├── jest.config.js ← Existing unit test config
└── jest.config.integration.js ← New integration test config

────────────────────────────────────────────────────────────────
```

---

## Test Execution Timeline

```
TIME 0s
  │
  ├─→ npm run test:integration
  │
  ├─→ Jest starts
  │
  ├─→ beforeAll() runs
  │   ├─ MongoDB Memory Server downloads/starts (first run: ~30s)
  │   ├─ Express app loads
  │   └─ ✅ Ready
  │
  ├─→ Test 1: "should register user"
  │   ├─ beforeEach() clears database
  │   ├─ Makes request to /api/auth/register
  │   ├─ Checks response
  │   └─ ✓ PASS
  │
  ├─→ Test 2: "should fail with duplicate"
  │   ├─ beforeEach() clears database
  │   ├─ Creates user, tries duplicate
  │   ├─ Checks error response
  │   └─ ✓ PASS
  │
  ├─→ afterAll() runs
  │   ├─ Stop database
  │   ├─ Close connections
  │   └─ ✅ Done
  │
TIME 10s ← All tests complete
```

---

## Database Isolation

```
TRADITIONAL TESTING ❌ (Risky)
┌──────────────────────┐
│  Real MongoDB        │
│                      │
│  Test 1 creates →    │  ← Data persists
│  Test 2 finds data   │  ← Tests interfere!
│  Test 3 deletes it   │  ← Order matters!
│                      │
│  Problem: Tests fail if run in different order
└──────────────────────┘


YOUR SETUP ✅ (Safe)
┌──────────────────────┐
│  Test 1              │
│  ├─ Fresh database   │
│  ├─ Clear data       │
│  └─ Clean up         │
└──────────────────────┘
         ↓
┌──────────────────────┐
│  Test 2              │
│  ├─ Fresh database   │
│  ├─ Clear data       │
│  └─ Clean up         │
└──────────────────────┘
         ↓
┌──────────────────────┐
│  Test 3              │
│  ├─ Fresh database   │
│  ├─ Clear data       │
│  └─ Clean up         │
└──────────────────────┘

✨ Each test is completely isolated!
✨ Tests can run in any order!
✨ No data leaks between tests!
```

---

## Request Pattern Examples

```
GET REQUEST (Retrieve data)
────────────────────
const response = await request(app)
  .get('/api/users')
  .set('Authorization', `Bearer ${token}`)
  .expect(200);


POST REQUEST (Create data)
────────────────────
const response = await request(app)
  .post('/api/users')
  .set('Authorization', `Bearer ${token}`)
  .send({
    name: 'John',
    email: 'john@example.com'
  })
  .expect(201);


PUT REQUEST (Update data)
────────────────────
const response = await request(app)
  .put('/api/users/user-id')
  .set('Authorization', `Bearer ${token}`)
  .send({ name: 'Jane' })
  .expect(200);


DELETE REQUEST (Delete data)
────────────────────
const response = await request(app)
  .delete('/api/users/user-id')
  .set('Authorization', `Bearer ${token}`)
  .expect(200);
```

---

## Test Output Interpretation

```
Test Output: ✓ __tests__/integration/auth.integration.test.js (5.234s)

|
├─ ✓ = Test passed ✅
├─ __tests__/integration/ = File location
├─ auth.integration.test.js = Filename
└─ (5.234s) = Time taken

────────────────────────

Tests:       4 passed, 4 total  ← All tests passed ✅
Snapshots:   0 total
Time:        12.345s           ← Total time

────────────────────────

FAIL = Tests failed ❌
│
└─ Error details show:
   ├─ Which test failed
   ├─ What was expected
   ├─ What was received
   └─ Which line in test file

Fix by:
1. Reading the error
2. Checking endpoint
3. Updating test expectations
4. Running again
```

---

## Common Test Scenarios

```
HAPPY PATH (Everything works) ✅
┌────────────────────────────────┐
│ Register user                  │
│ └─→ 201 Created ✓              │
├────────────────────────────────┤
│ Login with credentials         │
│ └─→ 200 OK, token sent ✓       │
├────────────────────────────────┤
│ Access protected endpoint      │
│ └─→ 200 OK, data returned ✓    │
└────────────────────────────────┘


ERROR CASES (Things go wrong) ❌
┌────────────────────────────────┐
│ Register with duplicate email  │
│ └─→ 400 Error ✓                │
├────────────────────────────────┤
│ Login with wrong password      │
│ └─→ 401 Unauthorized ✓         │
├────────────────────────────────┤
│ Access without token           │
│ └─→ 401 Unauthorized ✓         │
├────────────────────────────────┤
│ Update non-existent resource   │
│ └─→ 404 Not Found ✓            │
└────────────────────────────────┘
```

---

## Test Development Workflow

```
┌──────────────────────────────────────────────────┐
│          YOUR DEVELOPMENT WORKFLOW                │
└──────────────────────────────────────────────────┘

         ┌─────────────┐
         │   Write     │
         │    Code     │
         └──────┬──────┘
                │
                ↓
         ┌─────────────┐
         │  Run Tests  │
         │ (automated) │
         └──────┬──────┘
                │
         ┌──────┴──────┐
         ↓             ↓
      ✅ PASS      ❌ FAIL
         │             │
         │        ┌────┴──────┐
         │        │   Read    │
         │        │   Error   │
         │        └────┬──────┘
         │             │
         │        ┌────┴──────┐
         │        │   Fix     │
         │        │   Code    │
         │        └────┬──────┘
         │             │
         └─────┬───────┘
               │
               ↓
         ┌─────────────┐
         │  Confident  │
         │  Deployment │
         └─────────────┘
```

---

## Memory Usage (In-Memory DB)

```
Without Integration Tests (Current)
├─ Just unit tests
└─ 50MB RAM

With Integration Tests (New)
├─ MongoDB Memory Server: ~500MB (first run)
├─ Test runner: ~100MB
└─ Total: ~600MB

On CI/CD Server:
├─ Your machine: ~600MB (acceptable)
└─ GitHub Actions: Included in free tier ✅

Result: Fast, real testing WITHOUT a real database!
```

---

## Status Code Quick Reference for Tests

```
Success Codes 2️⃣🙂
  .expect(200)  ← OK - Request succeeded
  .expect(201)  ← Created - New resource made
  .expect(204)  ← No Content - Success, empty body

Client Error 4️⃣😞
  .expect(400)  ← Bad Request - Invalid data
  .expect(401)  ← Unauthorized - Login required
  .expect(403)  ← Forbidden - Not allowed
  .expect(404)  ← Not Found - Resource missing
  .expect(409)  ← Conflict - Duplicate/conflict

Server Error 5️⃣😱
  .expect(500)  ← Server Error - Something broke
```

---

## Your Command Cheat Sheet

```bash
# RUN ALL TESTS
npm run test:integration

# RUN SPECIFIC FILE
npm run test:integration -- filename.integration.test.js

# RUN SPECIFIC TEST
npm run test:integration -- --testNamePattern="should register"

# WATCH MODE (auto-rerun on changes)
npm run test:integration -- --watch

# SHOW COVERAGE
npm run test:integration -- --coverage

# VERBOSE OUTPUT (detailed info)
npm run test:integration -- --verbose

# STOP ON FIRST FAILURE
npm run test:integration -- --bail

# RUN UNIT TESTS ONLY
npm test

# RUN EVERYTHING (unit + integration)
npm run test:all
```

---

## 🎯 Key Takeaways

1. ✅ **Tests = Confidence** - Know your code works before deploying
2. ✅ **Automated = Reliable** - No manual testing missed
3. ✅ **Isolated = Safe** - Tests don't interfere with each other
4. ✅ **In-Memory DB = Fast** - No network delays, real database not needed
5. ✅ **Examples Provided = Easy** - Copy and modify existing tests

---

## 🚀 Next Step

Open `GETTING_STARTED.md` and follow the steps!

Then start with `PRACTICAL_GUIDE.md` for real examples.

Happy testing! 🎉

