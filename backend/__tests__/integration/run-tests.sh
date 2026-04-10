#!/bin/bash

# Integration Testing Quick Start
# ================================

# 1. Run all integration tests
echo "🧪 Running all integration tests..."
npm run test:integration

# 2. Run with coverage report
echo "📊 Running with coverage..."
npm run test:integration -- --coverage

# 3. Run specific test file
echo "🎯 Running specific test..."
npm run test:integration -- __tests__/integration/auth.integration.test.js

# 4. Run with detailed output
echo "📝 Running with verbose output..."
npm run test:integration -- --verbose

# 5. Watch mode for development
echo "👀 Running in watch mode..."
npm run test:integration -- --watch

# 6. Stop on first failure
echo "🛑 Running with bail (stop on first failure)..."
npm run test:integration -- --bail

# 7. Show test names only
echo "📋 Running with list output..."
npm run test:integration -- --listTests
