# Performance Testing Guide

## Overview

Performance testing measures how your API responds under various conditions:
- **Response time**: How long requests take
- **Concurrency**: Handling multiple simultaneous requests
- **Database efficiency**: Query performance
- **Memory usage**: Heap memory behavior
- **Load consistency**: Stable performance under load

## Quick Start

```bash
cd backend

# Run performance tests
npm run test:integration -- performance.integration.test.js

# Run performance tests with verbose output
npm run test:integration -- performance.integration.test.js --verbose

# Run specific performance test suite
npm run test:integration -- performance.integration.test.js --testNamePattern="Response Time"
```

## Performance Test Categories

### 1. Response Time Benchmarks

Tests measure endpoint response times and ensure they stay within acceptable thresholds:

```javascript
it('should register user in < 500ms', async () => {
  const startTime = performance.now();
  
  const res = await request(app)
    .post('/api/auth/register')
    .send(userData);
  
  const endTime = performance.now();
  const duration = endTime - startTime;

  console.log(`Registration time: ${duration.toFixed(2)}ms`);
  expect(duration).toBeLessThan(500); // SLA: 500ms
});
```

**Recommended SLAs (Service Level Agreements):**
- **Auth (login/register)**: 300-500ms
- **Profile retrieval**: 150-200ms
- **List operations**: 400-600ms
- **Search operations**: 300-500ms
- **Create operations**: 200-400ms

### 2. Concurrent Request Performance

Tests how the system handles multiple simultaneous requests:

```javascript
it('should handle 10 concurrent login requests', async () => {
  const startTime = performance.now();
  
  const promises = users.map(user =>
    request(app).post('/api/auth/login').send(user)
  );

  const results = await Promise.all(promises);
  const duration = performance.now() - startTime;

  console.log(`10 concurrent logins: ${duration.toFixed(2)}ms`);
  expect(duration).toBeLessThan(3000); // All 10 should complete in < 3 seconds
});
```

### 3. Database Query Performance

Measures query efficiency:

```javascript
it('should retrieve single user quickly', async () => {
  const startTime = performance.now();
  const res = await request(app)
    .get('/api/users/profile')
    .set('Authorization', `Bearer ${token}`);
  const duration = performance.now() - startTime;

  expect(duration).toBeLessThan(150); // Single DB query should be fast
});
```

### 4. Memory Usage Monitoring

Detects memory leaks during repeated operations:

```javascript
it('should not leak memory on repeated operations', async () => {
  const startMem = process.memoryUsage().heapUsed / 1024 / 1024;

  for (let i = 0; i < 50; i++) {
    await request(app).post('/api/inquiries').send(inquiryData);
  }

  const endMem = process.memoryUsage().heapUsed / 1024 / 1024;
  const memIncrease = endMem - startMem;

  console.log(`Memory increase: +${memIncrease.toFixed(2)}MB`);
  expect(memIncrease).toBeLessThan(100); // Reasonable increase
});
```

**Memory leak indicators:**
- Memory grows linearly with iterations
- Memory doesn't stabilize
- Memory increases > 100MB for 50 operations

### 5. Payload Size Impact

Tests performance with large request bodies:

```javascript
it('should handle large update payloads efficiently', async () => {
  const largeData = {
    name: 'Updated',
    addresses: Array(20).fill({ street: '...', city: '...' }),
  };

  const startTime = performance.now();
  const res = await request(app)
    .put('/api/users/profile')
    .send(largeData);
  const duration = performance.now() - startTime;

  expect(duration).toBeLessThan(500);
});
```

### 6. Load Consistency

Ensures performance remains stable across multiple requests:

```javascript
it('should maintain consistent performance', async () => {
  const durations = [];

  for (let i = 0; i < 20; i++) {
    const startTime = performance.now();
    await request(app).post('/api/inquiries').send(data);
    durations.push(performance.now() - startTime);
  }

  const avg = durations.reduce((a, b) => a + b) / durations.length;
  const max = Math.max(...durations);

  console.log(`Avg: ${avg.toFixed(2)}ms, Max: ${max.toFixed(2)}ms`);
  expect(avg).toBeLessThan(250);  // Average stable
  expect(max).toBeLessThan(500);  // No outliers
});
```

## Best Practices

### ✅ DO

1. **Test with realistic data**
   ```javascript
   // Good: realistic test data
   const userData = createTestUser({
     email: 'perf@test.com',
     addresses: Array(10).fill({...}), // Realistic payload
   });
   ```

2. **Run tests in isolation**
   ```bash
   # Run performance tests separately
   npm run test:integration -- performance.integration.test.js
   ```

3. **Use meaningful baselines**
   ```javascript
   // Good: specific, measurable thresholds
   expect(duration).toBeLessThan(300); // 300ms SLA
   ```

4. **Monitor trend**
   ```javascript
   console.log(`Response time: ${duration.toFixed(2)}ms`);
   // Tracks performance over time in logs
   ```

5. **Clean up between tests**
   ```javascript
   beforeEach(async () => {
     await clearDB(); // Fresh state for each test
   });
   ```

### ❌ DON'T

1. **Don't test with tiny payloads**
   ```javascript
   // Bad: unrealistic
   const userData = { name: 'A' };
   ```

2. **Don't set arbitrary thresholds**
   ```javascript
   // Bad: doesn't reflect real SLA
   expect(duration).toBeLessThan(1000); // Too loose
   ```

3. **Don't test mixed concerns**
   ```javascript
   // Bad: testing multiple things
   for (let i = 0; i < 100; i++) {
     // Creates, updates, deletes all in one test
   }
   ```

4. **Don't ignore outliers**
   ```javascript
   // Bad: ignores max time
   expect(avg).toBeLessThan(300);
   ```

## Setting Performance Thresholds

### Process

1. **Baseline**: Run tests 5+ times without threshold
2. **Analyze**: Note average, min, max times
3. **Set SLA**: Add 20-30% buffer to average
4. **Monitor**: Track over time for degradation

### Example Calculation

```
Run 5 times:
  Request 1: 145ms
  Request 2: 152ms
  Request 3: 148ms
  Request 4: 150ms
  Request 5: 151ms

Average: 149.2ms
Max: 152ms
Add 30% buffer: 149.2 × 1.3 = 194ms

Set SLA: expect(duration).toBeLessThan(200);
```

## Performance Profiling

### Option 1: Built-in Node.js Profiling

```bash
# Run with profiling
node --prof node_modules/.bin/jest performance.integration.test.js

# Analyze profile
node --prof-process isolate-*.log > profile.txt
cat profile.txt
```

### Option 2: Visual Studio Code Profiler

```bash
# Install Chrome DevTools
npm install --save-dev vscode-debugger

# Debug performance test
node --inspect-brk node_modules/.bin/jest performance.integration.test.js
```

Then open `devtools://devtools/bundled/js_app.html?v8only=true&ws=127.0.0.1:9229/` in Chrome.

### Option 3: Artillery (Load Testing Tool)

```bash
npm install --save-dev artillery

# Create artillery.yml
echo '
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
scenarios:
  - name: "API Load Test"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@test.com"
            password: "Test@1234"
' > artillery.yml

# Run load test
artillery run artillery.yml
```

## Continuous Performance Monitoring

### GitHub Actions Integration

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:integration -- performance.integration.test.js
```

### Performance Regression Detection

Track metrics over time:

```javascript
// performance.json - Store baseline
{
  "login": { "avg": 250, "max": 300, "timestamp": "2024-01-01" },
  "register": { "avg": 350, "max": 450, "timestamp": "2024-01-01" }
}

// Alert if > 20% degradation
if (currentAvg > baseline.avg * 1.2) {
  console.warn('PERFORMANCE DEGRADATION DETECTED');
}
```

## Interpreting Results

### Sample Output
```
⚡ Response Time Benchmarks
  Registration time: 245.32ms ✓
  Login time: 189.45ms ✓
  Get profile time: 128.67ms ✓
  10 concurrent logins: 1825.43ms (avg 182.54ms per request) ✓
  Memory increase: +15.32MB ✓
```

### Red Flags

- ⚠️ Response times increasing over time: Query optimization needed
- ⚠️ Concurrent requests slower than sequential: Connection pool issue
- ⚠️ Memory increasing linearly: Possible memory leak
- ⚠️ Large variance in response times: Inconsistent performance

## Optimization Tips

### For Slow Responses

1. **Database indexing**
   ```javascript
   // Add indexes on frequently queried fields
   userSchema.index({ email: 1 });
   userSchema.index({ role: 1 });
   ```

2. **Query optimization**
   ```javascript
   // Bad: N+1 query problem
   const users = await User.find();
   for (const user of users) {
     user.profile = await Profile.findById(user.profileId);
   }

   // Good: populate/aggregate
   const users = await User.find().populate('profileId');
   ```

3. **Caching**
   ```javascript
   const cache = new Map();
   
   const getProfile = async (id) => {
     if (cache.has(id)) return cache.get(id);
     const profile = await User.findById(id);
     cache.set(id, profile);
     return profile;
   };
   ```

### For Memory Leaks

1. **Release resources**
   ```javascript
   afterEach(async () => {
     await connection.close();
   });
   ```

2. **Clear large objects**
   ```javascript
   const largData = getData();
   processData(largeData);
   largeData = null; // Dereference for GC
   ```

### For Concurrency Issues

1. **Connection pooling**
   ```javascript
   // mongodb connection options
   mongoose.connect(uri, {
     maxPoolSize: 10,
     minPoolSize: 5,
   });
   ```

2. **Rate limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100,
   });
   ```

## Advanced: Custom Performance Metrics

```javascript
// Create custom performance reporter
class PerformanceReporter {
  constructor() {
    this.metrics = [];
  }

  record(name, duration, status) {
    this.metrics.push({ name, duration, status, timestamp: Date.now() });
  }

  report() {
    console.table(this.metrics);
    return {
      avg: this.metrics.reduce((a, b) => a + b.duration, 0) / this.metrics.length,
      max: Math.max(...this.metrics.map(m => m.duration)),
      min: Math.min(...this.metrics.map(m => m.duration)),
    };
  }
}

// Usage
const reporter = new PerformanceReporter();

it('should register quickly', async () => {
  const start = performance.now();
  const res = await request(app).post('/api/auth/register').send(userData);
  const duration = performance.now() - start;
  
  reporter.record('register', duration, res.status);
  expect(duration).toBeLessThan(500);
});

afterAll(() => {
  console.log('Final Report:', reporter.report());
});
```

## Resources

- [Jest Performance Testing](https://jestjs.io/docs/timer-mocks)
- [node:perf_hooks](https://nodejs.org/api/perf_hooks.html)
- [Artillery Load Testing](https://artillery.io/)
- [Chrome DevTools Profiler](https://developer.chrome.com/docs/devtools/performance/)
- [MongoDB Query Optimization](https://docs.mongodb.com/manual/core/query-optimization/)
