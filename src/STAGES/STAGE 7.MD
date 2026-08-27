Now implement the finalized Staff administration workflow.

Authorized administrators should be able to:

- create staff
- assign staff ID
- assign role
- assign department
- assign branch
- assign specialization
- activate/deactivate staff
- update administrative information

Doctors/nurses/staff should not use public patient registration.

Use Better Auth for authentication.

Ensure Better Auth user + Staff profile consistency.

If user creation succeeds but Staff creation fails, safely compensate using the existing architecture.

Never expose passwords or authentication secrets.

Use existing schemas/services.

Verify authorization on the API.

Run tests/build.

Do not deploy.