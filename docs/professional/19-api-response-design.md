# API Response Design

Responses should expose enough information for legitimate clients without leaking internal implementation.

Use stable error codes, correlation IDs and safe messages. Avoid returning stack traces, database errors or authorization details that aid enumeration.