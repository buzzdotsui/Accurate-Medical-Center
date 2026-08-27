Now finalize Patient administration.

Public patients continue using:

/register

Authorized Admin/Reception users can register a patient on behalf of a patient, particularly for walk-in patients.

The system must ensure every patient creation path uses the same PatientService/business logic.

Every successful patient registration must:

1. Create Patient record.
2. Generate unique Patient ID.
3. Create PATIENT_REGISTERED audit event.
4. Make the patient available to reporting/statistics.
5. Return/display the Patient ID appropriately.

Admin/Reception should also be able to:

- search patients
- view patients
- update administrative information
- activate/deactivate where authorized
- view patient history
- view appointments

Do not expose clinical information to roles that are not authorized to see it.

Run tests/build.

Do not deploy.