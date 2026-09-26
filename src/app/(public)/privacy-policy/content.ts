export const privacyPolicyContent = `# Privacy Policy — Accurate Medical Centre HMS

**Effective Date:** 25 September 2026  
**Version:** 1.0  
**System:** Accurate Medical Centre Hospital Management System (HMS)  
**Data Controller:** Accurate Medical Centre  
**Contact:** privacy@accuratemedicalcentre.com

---

## 1. Introduction and Scope

This Privacy Policy describes how Accurate Medical Centre ("we," "us," "our") collects, uses, discloses, and protects personal information and protected health information (PHI) processed through the Accurate Medical Centre Hospital Management System (HMS). The HMS is a comprehensive digital platform used by our hospital staff and patients in Nigeria for clinical care, billing, scheduling, laboratory, pharmacy, inpatient management, and patient portal services. This policy applies to all data subjects whose information is processed by the HMS, including patients (adults and children), healthcare providers, administrative staff, and any other individuals whose personal data enters the system. It is designed to comply with the **Nigeria Data Protection Regulation (NDPR) 2019** and guidance from the **Nigeria Data Protection Commission (NDPC)**. This policy addresses NDPR obligations only; the HMS does not intentionally process data of EU/EEA or US residents and is not subject to GDPR or HIPAA. [NEEDS LEGAL REVIEW: Confirm no cross-border patient relationships trigger foreign jurisdiction obligations.]

---

## 2. Information We Collect (Categories of PHI/PII)

We collect the following categories of personal and health information directly from patients, from healthcare providers during care delivery, and automatically through system operations:

**Patient Demographics & Identity:** Full name, date of birth, gender, blood group, genotype, phone number, email address, residential address, next-of-kin details (name, relationship, phone, address), and system-generated \`patientId\`.

**Medical & Clinical Data:** Medical history (past conditions, diagnoses), allergies (allergen, severity, reaction), chronic conditions (condition, status — ACTIVE/MANAGED/RESOLVED), and immunization records.

**Encounter & Clinical Records:** Visit records (chief complaint, vitals — BP, heart rate, temperature, SpO₂, weight, height stored as JSON), clinical notes (free-text), diagnoses (ICD-10 coded where applicable, type: PRIMARY/SECONDARY), treatment plans (instructions, follow-up date), admission/discharge summaries (mode of delivery, complications), and nursing notes.

**Laboratory & Diagnostic Data:** Lab requests (test name, category — HAEMATOLOGY/MICROBIOLOGY/etc., priority: ROUTINE/URGENT/STAT, status: REQUESTED/SAMPLED/ANALYZING/COMPLETED), results (findings, conclusions, reference ranges, abnormal flags, performedBy/verifiedBy staff IDs), and attachments (file URL, name, type).

**Radiology Data (Deferred Module — not active in Phase 1):** Scan requests (type: XRAY/ULTRASOUND/MRI/CT, region, priority, clinical notes), reports (findings, conclusions, radiologist ID), and images (URL, DICOM URL). *Radiology workflows are disabled in Phase 1; schema preserved for future activation.*

**Medication & Pharmacy Data:** Prescriptions (medication name, generic name, dosage, frequency, duration, quantity, dispensedQty, instructions, status: PENDING/PARTIAL/DISPENSED), medicine catalog (code, name, category, unit, price, stockQuantity, reorderLevel, requiresPrescription), and inventory transactions (type: IN/OUT/ADJUSTMENT, quantity, unitCost, supplier).

**Billing, Insurance & Financial Data:** Insurance (provider, policyNumber, groupNumber, expirationDate, isActive), invoices (line items with description/quantity/unitPrice/totalPrice, subTotal, discount, tax, totalAmount, amountPaid, status: UNPAID/PARTIAL/PAID/VOID, dueDate), payments (amount, method: CASH/CARD/TRANSFER/INSURANCE, reference, status: PENDING/COMPLETED/FAILED/REFUNDED, processedBy), and refunds.

**Appointments & Scheduling:** Appointments (appointmentId, date, timeSlot, type: IN_PERSON/ONLINE, reason, status: SCHEDULED/ARRIVED/COMPLETED/CANCELLED/NO_SHOW, doctorId), public booking requests (firstName, lastName, phone, email, service, preferredDate, notes), and walk-in check-ins.

**Inpatient & Ward Data:** Admissions (admissionId, reason, status: ADMITTED/DISCHARGED/TRANSFERRED, dischargeSummary), wards (name, type: GENERAL/PRIVATE/ICU/NICU), rooms (roomNumber), beds (bedNumber, status: AVAILABLE/OCCUPIED/MAINTENANCE), and surgery records.

**Staff & Workforce Data:** Staff identity (name, email, phone, address), role (13 roles: SUPER_ADMIN, ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, LAB_SCIENTIST, RADIOGRAPHER, ACCOUNTANT, THEATRE_STAFF, MATERNAL_STAFF, MENTAL_HEALTH, AMBULANCE, PATIENT), department, specialization, licenseNumber, staffId, branchId, authentication credentials (hashed password via Better Auth, session tokens), and shift schedules.

**Technical & Operational Data:** Audit logs (userId, userRole, action, resource, resourceId, details JSON, IP, userAgent, branchId, timestamp), system notifications (title, body, type: APPOINTMENT/CONSULTATION/LAB/RADIOLOGY/PRESCRIPTION/BILLING/INPATIENT/STAFF/SYSTEM, link, resource/resourceId, isRead), uploaded documents (title, fileUrl, fileType, uploadedBy), and consent forms (title, content, isSigned, signedAt, signatureUrl).

**Maternal & Child Data:** Pregnancy records (LMP, EDD, gravida, para, highRisk, status: ACTIVE/DELIVERED/TERMINATED), ANC visits (gestationalAge, fundalHeight, fetalHeartRate, presentation), delivery records (mode: VAGINAL/CS/VACUUM, complications), and child records (gender, birthWeight, apgarScore, status: HEALTHY/NICU/DECEASED).

**Mental Health Data (Deferred Module):** Psychological assessments (score JSON — PHQ-9/GAD-7, evaluation, assessorId) and therapy sessions (duration, sessionType: CBT/COUNSELING/ADDICTION, progressNotes, nextSteps). *Disabled in Phase 1.*

**Special Categories (Sensitive Data under NDPR):** Health data (physical/mental), genetic data (genotype), biometric data (blood group), and data concerning minors (pediatric patients).

---

## 3. How We Use the Information

We process personal and health information for the following purposes, each tied to a lawful basis under NDPR:

**Direct Patient Care & Treatment:** To diagnose, treat, and manage patient health; coordinate care among providers; maintain continuity across visits, admissions, and referrals; support clinical decision-making.

**Billing, Payments & Revenue Cycle:** To generate invoices, process payments (cash, card, transfer, insurance), manage insurance claims, issue refunds, track outstanding balances, and reconcile accounts.

**Hospital Operations & Administration:** To schedule appointments, manage patient queues, assign beds/wards, coordinate staff schedules, track inventory (pharmacy, lab supplies), and operate the facility safely and efficiently.

**Internal Analytics & Quality Improvement:** To generate operational dashboards (patient volumes, bed occupancy, lab turnaround, revenue, staff utilization) for internal management reporting. All analytics use aggregated or pseudonymized data where possible.

**Regulatory Compliance & Accreditation:** To maintain audit trails, satisfy Medical and Dental Council of Nigeria (MDCN) requirements, support NHIS reporting, comply with NDPR record-keeping obligations, and respond to lawful regulatory inquiries.

**Patient Communication & Engagement:** To send appointment reminders, lab result notifications, billing statements, discharge instructions, and portal access credentials via in-app notifications, email (Resend), or SMS (where consented).

**Security & Fraud Prevention:** To authenticate users, enforce role-based access control, detect unauthorized access attempts, and maintain system integrity.

**Research & De-Identified Analytics (Limited):** Where explicitly approved by an ethics committee and data is fully de-identified per NDPR guidelines, we may support approved clinical research. [NEEDS LEGAL REVIEW: Confirm ethics committee process and de-identification standards meet NDPR/NDPC requirements.]

---

## 4. Legal Basis for Processing (NDPR)

Under NDPR, we rely on the following lawful bases:

| Purpose | Lawful Basis (NDPR) |
|---------|---------------------|
| Direct patient care | **Vital interests** (life/health) + **Public interest** (healthcare delivery) |
| Billing & insurance | **Contract performance** (patient-provider agreement) + **Legal obligation** (tax, NHIS) |
| Hospital operations | **Legitimate interests** (efficient facility management) |
| Internal analytics | **Legitimate interests** (quality improvement) — pseudonymized where possible |
| Regulatory compliance | **Legal obligation** (MDCN, NHIS, NDPR, tax law) |
| Patient communication | **Consent** (for marketing/non-essential) + **Contract/Legitimate interest** (care-related) |
| Security & fraud prevention | **Legitimate interests** + **Legal obligation** (NDPR security principle) |
| Research | **Explicit consent** + **Public interest** (with ethics approval) |

No GDPR or HIPAA bases apply — the HMS operates exclusively in Nigeria for Nigerian data subjects.

---

## 5. How Information Is Shared

We do not sell personal or health information. We share data only as follows:

**Business Associates & Sub-Processors (under written DPAs):** 
- **Cloud hosting & edge:** Vercel (Next.js hosting) — DPAs executed
- **Database:** Supabase (managed PostgreSQL, AWS us-east-1) — SCCs + DPAs
- **Payment gateway:** Paystack (card/transfer) — PCI-DSS compliant, DPA
- **Email delivery:** Resend (transactional email) — DPA
- **File storage & CDN:** Cloudinary (image/document upload, optimization, delivery) — DPA
- **Authentication:** Better Auth (self-hosted, no external IdP) — no third-party auth data sharing

**Clinical Referrals & Continuity of Care:** With receiving hospitals, specialists, laboratories, and imaging centers when a patient is referred or transferred, limited to minimum necessary information.

**Insurance & Payers:** With patient consent or as required by policy, we share claim-relevant data (diagnosis codes, procedure codes, dates of service) with insurance companies/NHIS for reimbursement.

**Legal & Regulatory Authorities:** When compelled by court order, statutory mandate (e.g., notifiable disease reporting to NCDC), or regulatory investigation (MDCN, NDPC, FIRS). We log all such disclosures in audit logs.

**Emergency Situations:** To protect life or prevent serious harm, we may disclose PHI to emergency responders or family members per NDPR vital interests provision.

**Patient-Directed Disclosure:** Patients may authorize release of their records to third parties (e.g., personal representatives, other providers) via signed consent or portal authorization.

**No Sharing For:** Marketing by third parties, data brokerage, advertising profiling, or any purpose incompatible with the original collection purpose.

---

## 6. Data Security Measures

We implement technical and organizational measures appropriate to the sensitivity of health data:

**Encryption:** TLS 1.2+ for all data in transit (enforced via Vercel/Cloudflare); AES-256 encryption at rest for database volumes (Supabase), backups, and file storage (Cloudinary).

**Access Control:** Role-Based Access Control (RBAC) with 13 predefined roles (SUPER_ADMIN, ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, LAB_SCIENTIST, RADIOGRAPHER, ACCOUNTANT, THEATRE_STAFF, MATERNAL_STAFF, MENTAL_HEALTH, AMBULANCE, PATIENT). Principle of least privilege enforced via permission matrix (\`src/lib/auth/permissions.ts\`). Branch isolation ensures multi-branch data separation (\`buildBranchFilter\` in \`src/lib/auth/resource-authorization.ts\`).

**Authentication & Session Management:** Better Auth (self-hosted) with email/password, secure password hashing (bcrypt), HTTP-only Secure SameSite=Strict cookies, 7-day session expiry (\`expiresIn: 60*60*24*7\`), automatic session refresh (\`updateAge: 60*60*24\`), rate limiting (100 req/min/IP), and account lockout after failed attempts. \`role\` and \`branchId\` are \`input: false\` — cannot be set via public API.

**Multi-Factor Authentication (MFA):** Not currently implemented. [NEEDS LEGAL REVIEW: Assess NDPR "appropriate technical measures" requirement for MFA on privileged accounts (Admin, Doctor) and implement if required.]

**Audit Logging:** Immutable audit trail captures userId, userRole, action (CREATE/READ/UPDATE/DELETE/MANAGE), resource type/ID, details JSON, timestamp, IP, userAgent, branchId. Logs retained per Section 7. Stored in \`AuditLog\` model with indexes on userId and resource/resourceId.

**Network Security:** Vercel edge network with DDoS protection, WAF rules, and TLS enforcement. Supabase VPC with security groups restricting inbound to application ports only. No direct SSH access to database.

**Vulnerability Management:** Dependency scanning (\`npm audit\`, GitHub Dependabot), container image scanning (if Docker used), \`eslint\` + \`tsc --noEmit\` in CI, quarterly penetration testing recommended.

**Incident Response:** Documented incident response plan with escalation contacts (security@accuratemedicalcentre.com), breach assessment within 48 hours, and NDPC notification within 72 hours where required (see Section 9).

**Staff Training:** Annual privacy and security awareness training for all system users; specialized training for privileged roles (Admins, DBAs).

**Physical Security:** No on-premise servers — all infrastructure cloud-hosted (Vercel, Supabase, Cloudinary). Media disposal handled by cloud providers per their certifications (SOC 2, ISO 27001).

---

## 7. Data Retention and Deletion

| Data Category | Retention Period | Basis |
|---------------|------------------|-------|
| Clinical records (adults) | 10 years from last encounter | MDCN guidelines / NDPR storage limitation |
| Clinical records (minors) | 10 years after age of majority (18) | MDCN / Child Rights Act |
| Billing & financial records | 7 years | FIRS tax law / CAMA |
| Audit logs | 3 years (minimum) | NDPR accountability / security monitoring |
| Insurance claims | 7 years from claim closure | NHIS / contract |
| Prescriptions (dispensed) | 10 years | Pharmacy Council / clinical continuity |
| Appointment/scheduling data | 3 years after completion | Operational need |
| Staff HR records | 7 years post-employment | Labour Act / Pension Act |
| De-identified analytics | Indefinite (no personal identifiers) | Research/public interest |

**Deletion Process:** Soft-delete flags (\`deletedAt\` timestamp) retain referential integrity; hard deletion executed via scheduled job after retention expiry. Patients may request earlier deletion per Section 8 (subject to legal hold overrides). Backup retention mirrors primary retention + 90 days for disaster recovery (Supabase PITR).

---

## 8. Patient/User Rights

Under NDPR, data subjects have the following rights:

**Right of Access:** Request a copy of all personal/health data held, including purpose of processing, categories of data, recipients, retention period, and source. Provided via secure portal download or encrypted email within 30 days.

**Right to Rectification:** Request correction of inaccurate or incomplete data. Clinical corrections follow MDCN amendment procedures (addendum, not erasure of original entry). Actioned within 30 days.

**Right to Erasure ("Right to Be Forgotten"):** Request deletion where data is no longer necessary, consent withdrawn, or processing unlawful. **Exceptions:** Legal obligations (medical records retention, tax, audit), public interest (public health), legal claims, or archiving. We notify if exception applies.

**Right to Restriction of Processing:** Request suppression of processing while accuracy is contested, processing is unlawful, or data is needed for legal claims. Restricted data is marked and excluded from active workflows.

**Right to Data Portability:** Receive structured, commonly used, machine-readable copy (JSON/CSV) of data provided by the subject (demographics, appointments, portal-entered data). Clinical records generated by providers are excluded per NDPR.

**Right to Object:** Object to processing based on legitimate interests (analytics, operational reporting). We cease unless compelling legitimate grounds override.

**Right to Withdraw Consent:** For consent-based processing (marketing communications, research), withdraw at any time via portal settings or written request. Does not affect lawfulness of prior processing.

**Automated Decision-Making:** The HMS does not make solely automated decisions with legal/significant effects. Clinical decision support provides recommendations only; final decisions rest with qualified clinicians.

**Complaints:** Lodge a complaint with our Privacy Officer (privacy@accuratemedicalcentre.com) or directly with the Nigeria Data Protection Commission (NDPC) at https://ndpc.gov.ng.

**Exercising Rights:** Submit requests via the patient portal "Privacy" section, email, or written letter. We verify identity (patientId + DOB + registered phone/email) before disclosure.

---

## 9. Breach Notification Procedure

**Definition:** A personal data breach is a breach of security leading to accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to personal data.

**Internal Detection & Reporting:** Any staff member suspecting a breach reports immediately via security@accuratemedicalcentre.com or +234-XXX-XXXXXX. Automated alerts (unusual access patterns, failed logins, data exfiltration signals) trigger Security Team review within 1 hour.

**Assessment (0–48 hours):** Privacy Officer + Security Lead assess: nature of breach, categories/volume of data affected, data subjects impacted, likely consequences (identity theft, clinical harm, financial loss, reputational damage), and root cause.

**Notification to NDPC (within 72 hours of awareness):** Where breach poses risk to rights/freedoms, we notify NDPC per NDPR with: nature of breach, categories/approx. number of data subjects/records, contact details of DPO, likely consequences, and measures taken/proposed.

**Notification to Data Subjects (without undue delay):** Where breach poses high risk (clinical harm, financial fraud, identity theft), we notify affected individuals directly via email/SMS/portal with: description of breach, likely consequences, measures taken, and steps they can take.

**Documentation:** All breaches (notified or not) recorded in Breach Register with facts, effects, and remedial actions for NDPC audit.

**Post-Incident Review:** Root cause analysis within 14 days; corrective actions implemented and verified within 30 days.

---

## 10. Cookies and Tracking

The HMS web application (patient portal, staff dashboards) uses only **essential cookies**:

- **Session cookie** (\`__session\`): Authenticated session management, HTTP-only, Secure, SameSite=Strict, 7-day expiry.
- **CSRF token** (\`csrf_token\`): Cross-site request forgery protection, per-session.
- **Consent cookie** (\`cookie_consent\`): Records cookie banner dismissal, 1-year expiry.

**No analytics cookies** (Google Analytics, Matomo, Plausible), **no marketing pixels** (Meta, Google Ads), **no third-party tracking scripts**, and **no fingerprinting**. The mobile app (Capacitor/React Native) uses secure token storage (expo-secure-store) and does not use web cookies.

If analytics are added in future, a compliant consent banner (granular opt-in, reject-all option, no pre-ticked boxes) will be deployed per NDPR consent requirements. [NEEDS LEGAL REVIEW: Confirm NDPR cookie consent standard if analytics introduced.]

---

## 11. Children's Data

We provide pediatric services and process health data of children (under 18). For children:

- **Consent:** Parental/guardian consent obtained at registration (digital signature on consent form stored in HMS \`ConsentForm\` model).
- **Portal Access:** Parents/guardians manage child's portal access; adolescents (16+) may have independent access per Child Rights Act 2003 and NDPR age-of-consent guidance.
- **Special Protections:** Enhanced access logging for pediatric records; no marketing communications to minors; deletion requests honored per Section 7 minor retention rules.
- **Age Verification:** Date of birth verified at registration; system flags pediatric records for enhanced handling.

[NEEDS LEGAL REVIEW: Confirm alignment with Child Rights Act 2003, NDPR guidance on children's consent age, and any sector-specific pediatric data rules.]

---

## 12. International Data Transfers

**Primary Storage:** All production data resides in **AWS us-east-1 (Virginia, USA)** via Supabase managed PostgreSQL and Cloudinary (US CDN). Backups replicate to same region.

**Transfer Mechanism:** Since Nigeria lacks an adequacy decision, transfers rely on:

- **Standard Contractual Clauses (SCCs)** with Supabase (EU/US entities) and Cloudinary.
- **Supplementary measures:** Encryption in transit (TLS 1.3) and at rest (AES-256), pseudonymization of analytics datasets, and contractual restrictions on onward transfer.

**No Transfers To:** Countries under international sanctions, or jurisdictions with known surveillance laws conflicting with NDPR without supplementary safeguards.

[NEEDS LEGAL REVIEW: SCCs with Supabase/Cloudinary must be current (2021 EU SCCs) and supplemented by Transfer Impact Assessment (TIA) per NDPC guidance. Confirm Nigeria-specific transfer mechanism recognition by NDPC.]

---

## 13. Changes to This Policy

We may update this policy to reflect changes in law, regulation, technology, or our data practices. Material changes (new purposes, new third-party processors, retention changes, rights modifications) will be communicated via:

- Prominent banner on patient portal and staff dashboard 30 days before effective date.
- Email notification to registered patients and staff.
- Updated "Effective Date" and version number at top of policy.

Non-material changes (typo fixes, formatting, contact updates) take effect immediately upon posting. Continued use of the HMS after the effective date constitutes acceptance of the revised policy. Patients may exercise withdrawal/erasure rights if they disagree with material changes.

---

## 14. Contact Information

**Privacy Officer / Data Protection Officer (DPO)**  
**Name:** Privacy Office  
**Email:** accuratemedicalcenterofficial@gmail.com  
**Phone:** 0703 909 2836  
**Address:** 109 Irowo Street, Opposite Mega School, Hospital Road, Akure, Ondo State, Nigeria  

**Supervisory Authority:**  
Nigeria Data Protection Commission (NDPC)  
Plot 1083, Ahmadu Bello Way, Garki, Abuja  
Email: info@ndpc.gov.ng | Website: https://ndpc.gov.ng  

---

**End of Policy**`;