---
name: prune-tests
description: Prune tests that guard no behavior.
argument-hint: "[optional path]"
disable-model-invocation: true
---

Prune every test that guards no behavior. If the user passed a path, cover the tests under it; otherwise cover the whole suite.

**1. Find what each test depends on**

Keep a test only if it depends on the intended behavior: it should change only when that behavior changes, and fail only when it regresses. Behavior is what callers see through the public interface.

Prune tests that depend on:

**The past:** it asserts that removed code stays gone. Bringing it back would be a decision, not a regression.

For example:

- A feature was removed, and tests assert it's gone.
- A module was moved, and a test asserts it's absent from its old path.

**Nothing:** no change to your code can make it fail, so it has no reason of its own to change.

For example:

- It tests the platform: the browser fires a click event, or a library does what it documents. The platform is already tested.
- Its assertion holds whatever the code returns: `expect(true).toBe(true)`, or `toBeDefined()` on a value that is always defined.
- It mocks the unit under test, then asserts what the mock returns.
- It asserts what the type system already guarantees.

**The implementation:** it changes whenever the code does, even when behavior didn't.

For example:

- The expected value is derived from the same logic as the code, so a wrong result still passes.
- It asserts private state, internal call order, or which helper was invoked.

**Behavior another test already guards:** keep the test that goes through the public interface, and prune the copy.

**2. Prune**

- Delete tests that depend on the past, on nothing, or on behavior another test already guards.
- Rewrite a test that depends on the implementation so it asserts what callers see. If another test already guards that behavior, delete it.
- Delete production code that only the removed tests used, after a search confirms they were its only callers.
- Report each test you deleted or rewrote with its reason, as the labels in the example do.

**What done looks like**

- Every test left guards intended behavior.
- Each one would fail on a regression, and only on a regression.
- No test asserts code that no longer exists.
- No two tests guard the same behavior.
- No production code is left that only the removed tests used.
- The suite and the project's checks (typecheck, lint) still pass.

**Example**

```diff
--- a/pricing.test.ts
+++ b/pricing.test.ts
@@ rewritten: the expected value repeated the code's logic @@
 test("applies the discount", () => {
-  const price = 100;
-  expect(applyDiscount(price, 0.2)).toBe(price - price * 0.2);
+  expect(applyDiscount(100, 0.2)).toBe(80);
 });
--- a/cart.test.ts
+++ b/cart.test.ts
@@ rewritten against what callers see: it asserted private state @@
 test("adds an item to the cart", () => {
   const cart = new Cart();
   cart.add(book);
-  expect(cart._items.length).toBe(1);
+  expect(cart.total()).toBe(book.price);
 });
@@ deleted: checkout.test.ts already guards the same total @@
-test("total includes tax", () => {
-  expect(cartTotal([book], { tax: 0.1 })).toBe(11);
-});
--- a/export.test.ts
+++ b/export.test.ts
@@ deleted: it guards code that no longer exists @@
-test("legacy exporter is gone", () => {
-  expect(existsSync("src/export/legacy.ts")).toBe(false);
-});
--- a/session.test.ts
+++ b/session.test.ts
@@ deleted, with the production code that only existed for it @@
-test("clears the cache", () => {
-  _resetCacheForTests();
-  expect(_getCacheSize()).toBe(0);
-});
--- a/session.ts
+++ b/session.ts
@@ @@
-export function _resetCacheForTests() { cache.clear(); }
-export function _getCacheSize() { return cache.size; }
```
