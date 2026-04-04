#!/bin/bash
# Integration Testing Workflow Guide
# Run these commands step-by-step in your terminal

echo "=========================================="
echo "Integration Testing - Getting Started"
echo "=========================================="
echo ""

# Step 1: Navigate to backend
echo "Step 1️⃣ : Navigate to backend folder"
echo "$ cd backend"
echo ""

# Step 2: Check if dependencies are installed
echo "Step 2️⃣ : Check dependencies (should already be installed)"
echo "$ npm list supertest mongodb-memory-server"
echo ""

# Step 3: View existing tests
echo "Step 3️⃣ : View existing test files"
echo "$ ls -la __tests__/integration/"
echo ""

# Step 4: Run tests
echo "Step 4️⃣ : Run integration tests (THIS IS THE MAIN COMMAND)"
echo "$ npm run test:integration"
echo ""
echo "Expected output:"
echo "  ✓ Auth Integration - Registration"
echo "  ✓ Auth Integration - Login"  
echo "  ✓ Orders Integration - ..."
echo "  ✓ All tests passed!"
echo ""

# Step 5: Run with coverage
echo "Step 5️⃣ : Run with coverage report"
echo "$ npm run test:coverage"
echo ""

# Step 6: Run specific test
echo "Step 6️⃣ : Run only auth tests"
echo "$ npm run test:integration -- auth.integration.test.js"
echo ""

# Step 7: Watch mode
echo "Step 7️⃣ : Run in watch mode (auto-rerun on file change)"
echo "$ npm run test:integration -- --watch"
echo ""

# Step 8: Write your own test
echo "Step 8️⃣ : Create your own test file"
echo "$ touch __tests__/integration/my-tests.integration.test.js"
echo ""
echo "Then copy template from HOW_TO_TEST.md"
echo ""

# Step 9: Run your test
echo "Step 9️⃣ : Run your new test"
echo "$ npm run test:integration -- my-tests.integration.test.js"
echo ""

# Step 10: Debug
echo "Step 🔟 : Debug if test fails"
echo "$ npm run test:integration -- --verbose"
echo ""

echo "=========================================="
echo "✅ You're all set!"
echo "=========================================="
echo ""
echo "Quick Reference:"
echo "  npm run test:integration        - Run all integration tests"
echo "  npm run test:all                - Run unit + integration tests"
echo "  npm test                        - Run only unit tests"
echo "  npm run test:integration -- --coverage - Show coverage"
echo ""
echo "Documentation:"
echo "  HOW_TO_TEST.md     - Step-by-step guide (READ THIS FIRST!)"
echo "  QUICK_REFERENCE.md - Quick lookup for patterns"
echo "  README.md          - Full documentation"
