# Validation

## Automated

The repository includes static checks. Keep them passing before merging changes.

## Manual security scenarios

Validate at least:
1. a request where client and trusted catalog values match;
2. a manipulated client-side price;
3. a client-controlled payment state;
4. malformed JSON;
5. a representative HAR import;
6. evidence export after analysis.

## Acceptance criteria

The analyzer must clearly distinguish untrusted client values from server-owned values. Demonstrations should remain synthetic and must not claim that a sample reproduces the real price or state of an external service.
