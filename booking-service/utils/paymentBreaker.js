const CircuitBreaker = require("./CircuitBreaker");

// Single shared breaker for all calls to Payment Service
const paymentBreaker = new CircuitBreaker("payment-service", {
  failureThreshold: 3,
  resetTimeoutMs: 15000,
  // Only infrastructure problems count: no response (down/timeout/unregistered) or 5xx.
  // A 4xx like 402 "Payment failed" means the service is healthy.
  isFailure: (error) => !error.response || error.response.status >= 500,
});

module.exports = paymentBreaker;
