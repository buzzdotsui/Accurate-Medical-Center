Now finalize Appointment administration.

Authorized Admin/Reception users should be able to:

- create appointment
- select patient
- select doctor
- select date
- select time
- select appointment type
- provide reason
- reschedule
- cancel
- confirm/check-in where supported

Every appointment receives a unique Appointment ID.

Every important appointment action creates an audit event.

Respect:

- branch isolation
- doctor availability
- scheduling conflicts
- patient existence
- authorization
- existing appointment rules

Do not bypass existing AppointmentService/business logic.

Run tests/build.

Do not deploy.