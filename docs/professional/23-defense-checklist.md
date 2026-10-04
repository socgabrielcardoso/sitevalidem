# Defense Checklist

Before accepting a sensitive request:
- authenticate;
- authorize;
- validate schema;
- rederive authoritative values;
- enforce state;
- protect concurrency;
- log decision;
- return safe error;
- test negative cases.

Business logic is secure when the server owns the rules.