// Setup happy-dom for Bun test
// Import side effects will set up global DOM
import "happy-dom";

// Exclude e2e tests from unit test runner
import { test } from "bun:test";
test.except(["tests/e2e"]);
