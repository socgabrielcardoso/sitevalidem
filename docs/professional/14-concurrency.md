# Concurrency

Business logic may fail when two valid requests race.

Test stock, balance, coupon and reservation operations under simultaneous execution. Use transactions, locking or atomic operations where the invariant requires it.