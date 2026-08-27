Now review and implement the operational responsibilities for each role.

Do NOT blindly add functionality.

Use the existing RBAC system.

SUPER_ADMIN:

- system administration
- staff management
- branch management
- patient administration
- appointment administration
- reporting
- audit logs
- configuration

ADMIN:

- patient administration
- staff administration according to permissions
- appointments
- operational reporting

RECEPTION:

- register walk-in patients
- search patients
- update administrative patient information
- create/manage appointments
- check-in patients

DOCTOR:

- view assigned patients
- view appointments
- consultations
- clinical notes
- prescriptions
- referrals where supported

NURSE:

- patient queue
- vitals
- assigned clinical workflows
- ward workflows

PATIENT:

- own profile
- appointments
- registration
- permitted medical information
- notifications where supported

Do not grant excessive permissions.

Server-side authorization must enforce these permissions.

Do not rely on hiding UI buttons.

Report any existing permission conflicts before modifying them.