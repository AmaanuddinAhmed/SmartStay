class CircuitBreaker {
  constructor(
    name,
    {
      failureThreshold = 3,
      resetTimeoutMs = 15000,
      isFailure = () => true,
    } = {},
  ) {
    this.name = name;
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.isFailure = isFailure;

    this.state = "CLOSED";
    this.failureCount = 0;
    this.nextAttempt = null;
  }

  transition(newState) {
    if (this.state !== newState) {
      console.log(`[CircuitBreaker:${this.name}] ${this.state} → ${newState}`);
      this.state = newState;
    }
  }

  // Can a request be attempted right now?
  canRequest() {
    return this.state !== "OPEN" || Date.now() >= this.nextAttempt;
  }

  async fire(action) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        const error = new Error(`${this.name} circuit is OPEN`);
        error.circuitOpen = true;
        throw error;
      }
      this.transition("HALF_OPEN");
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error) {
      if (this.isFailure(error)) {
        this.onFailure();
      } else {
        this.onSuccess(); // Service responded properly (e.g. 402) → it's healthy
      }
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.nextAttempt = null;
    this.transition("CLOSED");
  }

  onFailure() {
    this.failureCount++;
    console.log(
      `[CircuitBreaker:${this.name}] failure ${this.failureCount}/${this.failureThreshold}`,
    );

    if (
      this.state === "HALF_OPEN" ||
      this.failureCount >= this.failureThreshold
    ) {
      this.nextAttempt = Date.now() + this.resetTimeoutMs;
      this.transition("OPEN");
    }
  }

  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      failureThreshold: this.failureThreshold,
      resetTimeoutSeconds: this.resetTimeoutMs / 1000,
      retryInSeconds:
        this.state === "OPEN"
          ? Math.max(0, Math.ceil((this.nextAttempt - Date.now()) / 1000))
          : 0,
    };
  }
}

module.exports = CircuitBreaker;
