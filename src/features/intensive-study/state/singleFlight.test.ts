/**
 * Single-flight suppression for an async task.
 *
 * The lock must be set synchronously before the task's first await, and
 * released in `finally` on both the resolve and reject paths, so a second
 * call can never be silently swallowed by a latched guard.
 */
import { describe, expect, it } from "vitest";
import { createSingleFlight } from "./singleFlight";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("createSingleFlight", () => {
  it("runs the task and resolves true when nothing is in flight", async () => {
    const singleFlight = createSingleFlight();
    const task = async () => {};
    let callCount = 0;
    const spiedTask = async () => {
      callCount += 1;
      await task();
    };

    const result = await singleFlight(spiedTask);

    expect(callCount).toBe(1);
    expect(result).toBe(true);
  });

  it("suppresses a second synchronous call while the first is in flight", async () => {
    const singleFlight = createSingleFlight();
    const deferred = createDeferred<void>();
    let callCount = 0;
    const task = async () => {
      callCount += 1;
      await deferred.promise;
    };

    const first = singleFlight(task);
    const second = singleFlight(task);

    expect(await second).toBe(false);
    expect(callCount).toBe(1);

    deferred.resolve();
    await first;
  });

  it("suppression does not disturb the first call's flight", async () => {
    const singleFlight = createSingleFlight();
    const deferred = createDeferred<void>();
    let completed = false;
    const task = async () => {
      await deferred.promise;
      completed = true;
    };

    const first = singleFlight(task);
    const second = singleFlight(task);
    await second;

    deferred.resolve();
    const firstResult = await first;

    expect(firstResult).toBe(true);
    expect(completed).toBe(true);
  });

  it("allows a sequential call after the previous flight resolved", async () => {
    const singleFlight = createSingleFlight();
    let callCount = 0;
    const task = async () => {
      callCount += 1;
    };

    const firstResult = await singleFlight(task);
    const secondResult = await singleFlight(task);

    expect(callCount).toBe(2);
    expect(firstResult).toBe(true);
    expect(secondResult).toBe(true);
  });

  it("releases the lock after the task resolves", async () => {
    const singleFlight = createSingleFlight();
    const task = async () => {};

    await singleFlight(task);
    const secondResult = await singleFlight(task);

    expect(secondResult).toBe(true);
  });

  it("releases the lock after the task rejects", async () => {
    const singleFlight = createSingleFlight();
    const error = new Error("first task failed");
    const failingTask = async () => {
      throw error;
    };

    await expect(singleFlight(failingTask)).rejects.toThrow(
      "first task failed",
    );

    let callCount = 0;
    const succeedingTask = async () => {
      callCount += 1;
    };
    const secondResult = await singleFlight(succeedingTask);

    expect(callCount).toBe(1);
    expect(secondResult).toBe(true);
  });

  it("propagates the task rejection to the caller unchanged", async () => {
    const singleFlight = createSingleFlight();
    const error = new Error("boom");
    const failingTask = async () => {
      throw error;
    };

    await expect(singleFlight(failingTask)).rejects.toBe(error);
  });
});
