# Replay

Operations such as payment confirmation, coupon redemption and approval may require replay protection.

Use idempotency keys, one-time tokens or server-side state to prevent the same valid request from creating repeated effects.