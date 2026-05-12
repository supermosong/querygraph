// rateLimit.js — tracks daily query counts per user, enforces tier limits
const requests = new Map();

const LIMITS = { free: 5, pro: 100, premium: Infinity };

// Returns today's date string used as the reset key
function today() {
  return new Date().toDateString();
}

// Checks if the user is within their daily limit; increments count if allowed
function checkLimit(userId, tier = 'free') {
  const limit = LIMITS[tier] ?? LIMITS.free;
  const key   = `${userId}:${today()}`;
  const count = requests.get(key) || 0;

  if (count >= limit) {
    return { allowed: false, limit, used: count };
  }

  requests.set(key, count + 1);
  return { allowed: true, limit, used: count + 1 };
}

module.exports = { checkLimit };
