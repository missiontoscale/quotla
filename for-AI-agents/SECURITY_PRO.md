# SECURITY_PRO.md — Security Governance for AI Agents

## Purpose

This is security governance for AI agents working on Quotla.

It does **not** duplicate OWASP or general security knowledge.

Instead it tells AI agents **how to use** your security knowledge when working on this project.

It repeatedly directs agents into `security-principles/` instead of duplicating those files.

---

## Security Development Workflow

Every security-sensitive task follows this workflow:

1. Read `MASTER_GUIDE.md` and `MASTER_CONTEXT.md`
2. Read this file (`SECURITY_PRO.md`)
3. Read the relevant principle files from `security-principles/` based on the task type (see table below)
4. Perform required threat modelling
5. Implement with security built in from the start
6. Write behavioral security tests that attempt to break the implementation
7. Run all verification steps
8. Update `SECURITY_LOOPHOLES.md` if a new vulnerability is discovered
9. Update `PROGRESS_TRACKER.md`

---

## Mandatory Reading Rules

| Task Type | Must Read These Files in `security-principles/` |
|-----------|------------------------------------------------|
| Authentication / Login / Signup | OWASP Top 10 2025 — A07 Authentication Failures |
| Authorization / Access Control | OWASP Top 10 2025 — A01 Broken Access Control |
| API Routes / Data Endpoints | OWASP Top 10 2025 — A01, A05, A07 |
| Database Queries | OWASP Top 10 2025 — A05 Injection |
| File Uploads | OWASP Top 10 2025 — A06 Insecure Design |
| Cryptography / Encryption | OWASP Top 10 2025 — A04 Cryptographic Failures |
| Dependency Changes | OWASP Top 10 2025 — A03 Software Supply Chain Failures |
| Any user-facing feature | OWASP Top 10 2025 — A01, A05, A07, A08 |
| Configuration / Deployment | OWASP Top 10 2025 — A02 Security Misconfiguration |

When in doubt, read the full OWASP Top 10 2025 reference.

---

## Required Threat Modelling

Before implementing any security-sensitive feature, consider:

- Who is the attacker?
- What can they control?
- What is the asset at risk?
- What is the worst-case outcome if this fails?
- What is the mitigation?

Document your threat model in implementation notes or PR description.

---

## Required Security Reviews

The following require explicit security review:

- Authentication and session management changes
- Authorization and access control changes
- Any code handling payment data (PCI-DSS relevance)
- Any code handling personal data
- Database schema changes that affect RLS policies
- New API endpoints
- New dependencies
- Changes to error handling that could leak information

---

## Security Testing Requirements

- Write behavioral tests that verify security controls, not just code patterns
- Test that User A cannot access User B's data
- Test that anonymous users cannot access protected APIs
- Test that expired sessions fail
- Test that reset tokens expire
- Test that admin APIs reject non-admins
- Test that deleted users lose access
- Test that free users cannot exceed plan limits
- Test that credits cannot be forged

---

## Dependency Review Policy

- Pin dependency versions
- Scan for CVEs regularly (`npm audit`)
- Avoid hallucinated packages — verify package legitimacy
- Remove unused dependencies
- Flag dependencies not updated in 12+ months
- Prefer packages with strong security track records

---

## AI Safety Policy

Never allow AI to:
- Execute arbitrary shell commands without human approval
- Modify production databases directly
- Deploy automatically
- Delete infrastructure
- Rotate secrets
- Access unrestricted filesystem locations
- Override prompt instructions from user content

Require:
- Human approval for destructive operations
- Permission boundaries
- Audit logs

---

## Production Deployment Rules

- Never deploy with `ignoreBuildErrors: true`
- Never deploy with debug mode enabled
- Never expose stack traces to users
- Never expose environment variables to the client
- Always verify CSP, HSTS, and security headers before deployment
- Always run `npm run security:check` before deployment

---

## Security Approval Checklist

Before considering security work complete:
- [ ] Relevant `security-principles/` files were read
- [ ] Threat model was considered
- [ ] Input validation is performed server-side (not just client-side)
- [ ] Authentication is verified server-side on every endpoint
- [ ] Authorization checks are performed on every request
- [ ] SQL queries use parameterized queries only
- [ ] No secrets are exposed in client bundles
- [ ] RLS policies are enabled and tested (if Supabase)
- [ ] Rate limiting is implemented on login, registration, and expensive operations
- [ ] Error responses do not leak implementation details
- [ ] Security headers are configured
- [ ] Behavioral security tests pass
- [ ] `SECURITY_LOOPHOLES.md` is updated if vulnerabilities were found

---

## Definition of Secure

A feature is secure when:
- All user input is treated as hostile until proven otherwise
- Default is deny, not allow
- Every endpoint independently authenticates, authorizes, validates, and logs
- No secrets are exposed
- The client is never trusted
- Convenience is never prioritized over security
- Relevant OWASP Top 10 risks are identified and mitigated
- Security-focused tests attempt to break the implementation and fail to do so
