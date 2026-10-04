# Business State Machine

Sensitive workflows should define valid states and transitions.

Example:
draft → submitted → approved → fulfilled.

The server must reject skipped, reversed or unauthorized transitions even if the client can craft the request.