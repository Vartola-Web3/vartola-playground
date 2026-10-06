# Access control matrix

Status: INTERNAL / PRE-AUDIT. Source of truth in code: `lib/ops/roles.ts` (`MATRIX`). A test asserts that duties stay separated. This file mirrors it; if they differ, the code wins.

Roles: PLATFORM_OWNER, CONTRACT_ADMIN, PAUSER, TREASURY, UNDERWRITER, OPERATIONS, COMPLIANCE, SERVICING, AUDITOR_READ_ONLY.

| Action | Roles |
| --- | --- |
| View dashboards | all roles |
| Manage users | PLATFORM_OWNER |
| Approve underwriting | UNDERWRITER |
| Score facility | UNDERWRITER, OPERATIONS |
| Attest risk | UNDERWRITER |
| Attest documents | OPERATIONS, COMPLIANCE |
| Authorize release | CONTRACT_ADMIN |
| Pay supplier | TREASURY |
| Confirm delivery | OPERATIONS |
| Record repayment | OPERATIONS, SERVICING |
| Quote settlement | OPERATIONS |
| Manage collections | SERVICING, OPERATIONS |
| Authorize recovery | OPERATIONS, CONTRACT_ADMIN |
| Pause contracts | PAUSER, CONTRACT_ADMIN |
| Unpause contracts | CONTRACT_ADMIN |
| Rotate admin | PLATFORM_OWNER, CONTRACT_ADMIN |
| Upgrade contract | PLATFORM_OWNER, CONTRACT_ADMIN |
| Manage compliance | COMPLIANCE |
| Manage pilots | PLATFORM_OWNER, OPERATIONS |
| Run reconciliation | OPERATIONS, PLATFORM_OWNER, AUDITOR_READ_ONLY |
| Export reports | PLATFORM_OWNER, OPERATIONS, TREASURY, AUDITOR_READ_ONLY |
| Manage secrets | PLATFORM_OWNER |
| Change settlement asset | PLATFORM_OWNER, CONTRACT_ADMIN |
| Exceptional release | PLATFORM_OWNER, CONTRACT_ADMIN |

## Principles

- Release authorization and supplier payment are different roles.
- The auditor role is read-only.
- MFA is required for PLATFORM_OWNER, CONTRACT_ADMIN, TREASURY and OPERATIONS in Alpha mode.
- Suppliers and SMEs are not privileged roles. A supplier can submit documents and evidence and see release status. It cannot approve its own release, change facility terms, or bypass underwriting or compliance.
- In this build the application login roles map as: ADMIN to PLATFORM_OWNER and CONTRACT_ADMIN, ADMIN_REVIEWER to OPERATIONS and SERVICING, UNDERWRITER to UNDERWRITER. Dedicated treasury, pauser, compliance and auditor logins are a pre-Mainnet task.
