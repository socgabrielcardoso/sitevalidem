# Mass Assignment

Mass assignment happens when the backend binds client fields directly to privileged model properties.

Use explicit allowlists for writable fields. Never let clients set role, ownership, approval, internal status or server-calculated values unless the operation explicitly authorizes it.