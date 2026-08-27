Now implement/complete the HMS audit logging layer.

First inspect the existing:

/settings/audit
/api/v1/settings/audit
AuditLog model
audit service
existing audit events

Reuse the existing architecture.

Do NOT create a duplicate logging system.

Every important administrative action must create an audit event.

At minimum:

PATIENT_REGISTERED
PATIENT_UPDATED
PATIENT_ACTIVATED
PATIENT_DEACTIVATED

STAFF_CREATED
STAFF_UPDATED
STAFF_ACTIVATED
STAFF_DEACTIVATED

APPOINTMENT_CREATED
APPOINTMENT_UPDATED
APPOINTMENT_CANCELLED
APPOINTMENT_COMPLETED

Record appropriate:

- actor
- action
- entity type
- entity ID
- timestamp
- success/failure where supported
- relevant non-sensitive metadata

NEVER log:

- passwords
- password hashes
- auth secrets
- session tokens
- API tokens
- database passwords
- Redis credentials
- Cloudinary secrets
- unnecessary medical information

Ensure patient registration through /register also generates PATIENT_REGISTERED.

Ensure Admin/Reception registration generates the same event.

Do not duplicate business logic.

Do not deploy.

Run validation/build checks and report results.