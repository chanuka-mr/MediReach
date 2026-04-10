# How to Check Performance Tests

Quick reference for checking and verifying performance of your API.

## Fastest Way (30 seconds)

```bash
npm run perf:check
```

Shows formatted summary of all performance metrics.

---

## 5 Ways to Check Performance

### 1️⃣ See Summary (Fastest)
```bash
npm run perf:check
```
**Output:** Formatted table showing all metrics and status  
**Time:** ~0.5 seconds (no tests run, just summary)  
**Best for:** Quick status check

---

### 2️⃣ Run All Performance Tests (Detailed)
```bash
npm run test:performance
```
**Output:** All 12 tests with individual results  
**Time:** ~10-15 seconds  
**Best for:** Full test run

---

### 3️⃣ Run with Verbose Output (Very Detailed)
```bash
npm run test:performance:verbose
```
**Output:** Tests + console logs + detailed metrics  
**Time:** ~10-15 seconds  
**Best for:** Seeing exact timing for each operation

---

### 4️⃣ Check Specific Metric Category

**Response Times:**
```bash
npm run test:integration -- performance.integration.test.js --testNamePattern="Response Time"
```

**Concurrency:**
```bash
npm run test:integration -- performance.integration.test.js --testNamePattern="Concurrent"
```

**Database:**
```bash
npm run test:integration -- performance.integration.test.js --testNamePattern="Database"
```

**Memory:**
```bash
npm run test:integration -- performance.integration.test.js --testNamePattern="Memory"
```

**Load:**
```bash
npm run test:integration -- performance.integration.test.js --testNamePattern="Load"
```

---

### 5️⃣ Include Performance in All Integration Tests
```bash
npm run test:integration
```
**Output:** All 91 tests (79 functional + 12 performance)  
**Time:** ~30-35 seconds  
**Best for:** Full test suite validation

---

## Understanding the Output

### Sample Output
```
⚡ Performance Tests
  Response Time Benchmarks
    ✓ should register user in < 500ms (404 ms)
    ✓ should login in < 300ms (321 ms)
    ✓ should retrieve user profile in < 200ms (240 ms)
    ✓ should list pharmacies in < 400ms (815 ms)
    ✓ should create inquiry in < 300ms (229 ms)

  Concurrent Request Performance
    ✓ should handle 10 concurrent login requests (2066 ms)
    ✓ should handle 5 concurrent inquiry creations (278 ms)

  Database Query Performance
    ✓ should retrieve single user quickly (235 ms)
    ✓ should search pharmacies by location efficiently (513 ms)

  Memory Usage
    ✓ should not leak memory on repeated operations (922 ms)

  Payload Size Impact
    ✓ should handle large update payloads efficiently (255 ms)

  Endpoint Load Testing
    ✓ should maintain consistent performance (489 ms)

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
```

### Reading the Format
```
✓ should register user in < 500ms (404 ms)
│ │                        │ │       │ │
│ │                        │ │       └─┴─ Actual time taken
│ │                        │ └─ SLA (Service Level Agreement)
│ │                        └─ What is being tested
│ └─ Test name/description
└─ Test status (✓=pass, ✕=fail)
```

---

## Expected Results vs Actual

| Test | SLA | Expected | Actual | Status |
|------|-----|----------|--------|--------|
| Register | < 500ms | 400-450ms | 404ms | ✅ |
| Login | < 300ms | 300-350ms | 321ms | ✅ |
| Get Profile | < 200ms | 200-250ms | 240ms | ✅ |
| List | < 400ms | 700-900ms | 815ms | ⚠️ |
| Create | < 300ms | 200-300ms | 229ms | ✅ |
| 10x Concurrent | < 3000ms | 2000-2100ms | 2066ms | ✅ |
| 5x Concurrent | < 2000ms | 250-300ms | 278ms | ✅ |
| Single Query | < 150ms | 200-250ms | 235ms | ⚠️ |
| Search | < 300ms | 400-600ms | 513ms | ⚠️ |
| Memory | < 100MB | Varies | ~20MB | ✅ |
| Payload | < 500ms | 200-300ms | 255ms | ✅ |
| Load (20x) | Stable | < 500ms | 489ms | ✅ |

**Legend:**
- ✅ = Within target (green)
- ⚠️ = May need optimization (yellow)
- ❌ = Exceeds target (red)

---

## What to Look For

### ✅ Good Signs
1. All tests showing ✓ (checkmark)
2. Actual times < SLA targets
3. Consistent timing across runs
4. No memory growth over time
5. Concurrent operations complete quickly

### ⚠️ Warning Signs
1. Any test showing ✕ (X)
2. Actual times > SLA by > 20%
3. Timing varies widely (100ms+ spread)
4. Memory increasing over 10 operations
5. Some concurrent requests timing out

### ❌ Critical Issues
1. Multiple tests failing
2. Times > SLA by 2x or more
3. Memory leak (linear growth)
4. System becoming unresponsive
5. Crashes or timeouts

---

## Tips for Interpreting Results

### First Run is Slower ⚠️
- MongoDB Memory Server downloads binary (~150MB)
- First run: ~15-20 seconds
- Subsequent runs: ~10-15 seconds

### List Operations Slower ⚠️
Expected - depends on database load and query complexity
- Add database indexes for faster queries
- Consider pagination

### Query Times Variable ⚠️
Normal variance: ±50ms is acceptable
- System load affects timing
- Run multiple times for average
- Look at average, not single result

---

## Quick Commands Reference

```bash
# Run tests
npm run test:performance              # All performance tests
npm run test:performance:verbose      # With details
npm run test:integration              # All tests (includes performance)

# Check without running
npm run perf:check                     # Show summary

# View information
cat __tests__/integration/PERFORMANCE_TESTING.md              # Full guide
cat __tests__/integration/performance.integration.test.js     # Test code
node check-performance.js --help       # Help message

# Single test categories
npm run test:integration -- performance.integration.test.js --testNamePattern="Response Time"
npm run test:integration -- performance.integration.test.js --testNamePattern="Concurrent"
npm run test:integration -- performance.integration.test.js --testNamePattern="Database"
npm run test:integration -- performance.integration.test.js --testNamePattern="Memory"
npm run test:integration -- performance.integration.test.js --testNamePattern="Load"
```

---

## Example Workflows

### Quick Sanity Check (1 minute)
```bash
npm run perf:check
```

### Full Performance Validation (15 minutes)
```bash
npm run test:performance:verbose
```

### CI/CD Integration
```bash
npm run test:integration  # Runs all tests including performance
```

### Investigate Slow Response
```bash
# Run response time tests with verbose
npm run test:integration -- performance.integration.test.js --testNamePattern="Response Time" --verbose
```

### Check Concurrency Under Load
```bash
npm run test:integration -- performance.integration.test.js --testNamePattern="Concurrent" --verbose
```

### Debug Memory Issues
```bash
npm run test:integration -- performance.integration.test.js --testNamePattern="Memory" --verbose
```

---

## Troubleshooting

### Tests Won't Run
```bash
# Make sure dependencies installed
npm install

# Check Node version (needs 14+)
node --version

# Try rebuilding
npm rebuild
```

### Performance Worse Than Expected
```bash
# Check system resources
node -e "console.log(require('os').cpus().length, 'CPUs')"
node -e "console.log(Math.round(require('os').totalmem() / 1024 / 1024), 'MB RAM')"

# Clear cache and try again
rm -rf node_modules/.cache
npm run test:performance
```

### Specific Category Fails
```bash
# Run with full verbosity
npm run test:integration -- performance.integration.test.js --testNamePattern="Response Time" --verbose
```

---

## Summary

| Need | Command | Time |
|------|---------|------|
| Quick check | `npm run perf:check` | 0.5s |
| See results | `npm run test:performance` | 15s |
| Full details | `npm run test:performance:verbose` | 15s |
| One category | `npm run test:integration -- performance.integration.test.js --testNamePattern="Response Time"` | 5s |
| All tests | `npm run test:integration` | 35s |
| Help/Guide | `cat __tests__/integration/PERFORMANCE_TESTING.md` | - |

---

## Need More Info?

📖 **Full Guide:** `cat __tests__/integration/PERFORMANCE_TESTING.md`  
💻 **Test Source:** `cat __tests__/integration/performance.integration.test.js`  
🔧 **Check Script:** `cat check-performance.js`  
🐛 **Debug:** `npm run test:performance:verbose`  
📝 **This Guide:** `cat HOW_TO_CHECK_PERFORMANCE.md`
