# 🔒 Security Deployment Checklist

Use this checklist before deploying Quotla to production.

## 🔴 CRITICAL - Must Complete Before Deployment

### Secrets & Environment

- [ ] **Remove `.env` from git history**
  ```bash
  git rm --cached .env
  git commit -m "Remove .env from tracking"
  ```

- [ ] **Rotate ALL API keys** (they're exposed in the current `.env`)
  - [ ] Generate new Anthropic API key
  - [ ] Generate new OpenAI API key
  - [ ] Generate new Google AI API key
  - [ ] Consider rotating Supabase keys if exposed

- [ ] **Set up production environment variables** in your hosting platform
  - Vercel: Project Settings → Environment Variables
  - Add all values from `.env.example`
  - Never commit production secrets to git

- [ ] **Verify `.gitignore` includes `.env`**
  ```bash
  git check-ignore .env  # Should output: .env
  ```

### Application Configuration

- [ ] **Update `NEXT_PUBLIC_APP_URL`** to production domain
  ```bash
  NEXT_PUBLIC_APP_URL=https://your-production-domain.com
  ```

- [ ] **Enable HTTPS enforcement** (automatic on Vercel/Netlify)
  - Verify SSL certificate is active
  - Test that HTTP redirects to HTTPS

- [ ] **Verify middleware is active**
  - Check [middleware.ts](middleware.ts) is not bypassed
  - Test protected routes redirect to login

### Build & Code Quality

- [ ] **Run security audit**
  ```bash
  npm run security:check
  ```
  - Fix all HIGH and CRITICAL vulnerabilities
  - Document any remaining MODERATE issues

- [ ] **Fix TypeScript errors**
  ```bash
  npm run type-check
  ```
  - Build should not ignore TypeScript errors

- [ ] **Fix ESLint warnings**
  ```bash
  npm run lint:fix
  ```

- [ ] **Test production build locally**
  ```bash
  npm run build
  npm run start
  ```

## 🟠 HIGH PRIORITY - Complete Within First Week

### Authentication & Authorization

- [ ] **Test authentication flow**
  - [ ] Signup creates user profile
  - [ ] Login redirects to dashboard
  - [ ] Logout clears session
  - [ ] Protected routes require auth

- [ ] **Test admin access control**
  - [ ] Non-admin users can't access /admin
  - [ ] Admin flag properly checked in database
  - [ ] Admin-only API routes protected

- [ ] **Test password requirements**
  - [ ] Weak passwords rejected
  - [ ] Password validation works on signup

### Rate Limiting

- [ ] **Verify rate limits are active**
  - [ ] Test AI endpoints return 429 after limit
  - [ ] Rate limit headers present in response
  - [ ] Different users have separate limits

- [ ] **Monitor AI API usage**
  - [ ] Set up billing alerts in AI provider dashboards
  - [ ] Track costs daily for first week
  - [ ] Adjust rate limits if needed

### Database Security

- [ ] **Verify RLS policies are enabled**
  ```sql
  -- Run in Supabase SQL editor
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public';
  ```
  - All tables should show `rowsecurity = true`

- [ ] **Test data isolation**
  - [ ] Users can only see their own quotes
  - [ ] Users can only see their own clients
  - [ ] Users cannot access other users' data

- [ ] **Test admin access**
  - [ ] Admin users can view all data
  - [ ] Admin panel functions correctly

## 🟡 MEDIUM PRIORITY - Complete Within First Month

### Monitoring & Logging

- [ ] **Set up error monitoring** (recommended: Sentry)
  ```bash
  npm install @sentry/nextjs
  ```

- [ ] **Enable audit logging** in critical operations
  - [ ] Account deletions logged
  - [ ] Admin actions logged
  - [ ] Failed auth attempts logged

- [ ] **Set up uptime monitoring**
  - UptimeRobot (free)
  - Pingdom
  - Better Uptime

### Security Headers

- [ ] **Verify security headers in production**
  - Test at: https://securityheaders.com
  - Should achieve A or A+ rating

- [ ] **Test Content Security Policy**
  - Check browser console for CSP violations
  - Adjust CSP if legitimate resources blocked

### File Uploads

- [ ] **Test file upload validation**
  - [ ] Reject files over 2MB
  - [ ] Reject non-image files
  - [ ] Files stored securely in Supabase Storage

- [ ] **Configure storage bucket policies**
  - Public read for necessary files only
  - Authenticated upload only

## 🟢 LOW PRIORITY - Ongoing Maintenance

### Regular Security Tasks

- [ ] **Weekly:**
  - Review Supabase auth logs
  - Check for unusual activity patterns
  - Monitor rate limit violations

- [ ] **Monthly:**
  - Run `npm audit` and update dependencies
  - Review security documentation
  - Check for new vulnerabilities in dependencies

- [ ] **Quarterly:**
  - Rotate AI API keys
  - Security audit
  - Review and update security policies
  - Update dependencies to latest stable

### Additional Security Enhancements

- [ ] **Add 2FA for admin accounts** (future enhancement)
- [ ] **Implement session timeout** (future enhancement)
- [ ] **Add IP-based blocking** for repeated failed logins
- [ ] **Set up DDoS protection** (Cloudflare, etc.)
- [ ] **Implement webhook signature verification** (if using webhooks)

## ✅ Post-Deployment Verification

### Immediate (Day 1)

- [ ] **Verify authentication works in production**
  - Create test account
  - Login/logout
  - Access protected pages

- [ ] **Test all main features**
  - Create quote
  - Generate invoice
  - Use AI generation features
  - Export documents

- [ ] **Check error tracking**
  - Verify errors appear in monitoring tool
  - Test error boundaries work

### First Week

- [ ] **Monitor for issues**
  - Check error rates daily
  - Review user feedback
  - Monitor API costs

- [ ] **Performance testing**
  - Test load times
  - Check database query performance
  - Optimize slow queries

### First Month

- [ ] **Security review**
  - No unauthorized access attempts succeeded
  - Rate limiting working as expected
  - No secret leaks detected

- [ ] **User feedback**
  - Collect user security concerns
  - Address any UX issues with security features

## 🚨 Emergency Contacts

**If security incident occurs:**

1. **Immediate Actions:**
   - Document what happened
   - Rotate any exposed credentials
   - Check audit logs
   - Preserve evidence

2. **Within 24 hours:**
   - Assess impact
   - Notify affected users if needed
   - Implement fixes
   - Update security documentation

3. **Within 1 week:**
   - Conduct post-mortem
   - Update security procedures
   - Implement preventive measures

## 📚 Resources

- **Security Documentation:** [SECURITY.md](SECURITY.md)
- **Deployment Guide:** [documentation/DEPLOYMENT.md](documentation/DEPLOYMENT.md)
- **Environment Setup:** [.env.example](.env.example)
- **Supabase Security:** https://supabase.com/docs/guides/platform/security
- **Next.js Security:** https://nextjs.org/docs/app/building-your-application/deploying#security

---

**Last Updated:** December 6, 2025
**Next Review:** Before every major deployment
