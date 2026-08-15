import assert from "node:assert/strict";
import test from "node:test";
import {
  signAdminSession,
  verifyAdminPassword,
  verifyAdminSession,
} from "./admin-crypto.ts";

test("configured admin password verifies the correct password only", () => {
  const passwordKey = "a-password-key-that-is-longer-than-thirty-two-bytes";
  assert.equal(verifyAdminPassword("correct horse battery staple", "correct horse battery staple", passwordKey), true);
  assert.equal(verifyAdminPassword("wrong password", "correct horse battery staple", passwordKey), false);
  assert.equal(verifyAdminPassword("anything", "", passwordKey), false);
});

test("signed admin sessions reject tampering and expiry", () => {
  const secret = "a-test-secret-that-is-longer-than-thirty-two-bytes";
  const now = Date.UTC(2026, 7, 15);
  const token = signAdminSession("admin", secret, now);

  assert.equal(verifyAdminSession(token, secret, now)?.sub, "admin");
  assert.equal(verifyAdminSession(`${token}tampered`, secret, now), null);
  assert.equal(verifyAdminSession(token, "different-secret-that-is-also-long-enough", now), null);
  assert.equal(verifyAdminSession(token, secret, now + 9 * 60 * 60 * 1000), null);
});
