# Product Requirements Document: Simple Agent Playground

## 1. Overview

The Agent Playground is a lightweight Astro-based web application for quickly publishing small test pages that can be interacted with by AI agents such as ChatGPT, browser agents, crawlers, and automation tools.

The goal is to make it fast to release controlled testing pages, observe how agents behave on them, and review interaction events in a protected admin area.

Accessibility is a top priority. Every released page must be usable with assistive technologies and follow strong semantic HTML practices.

The application should be simple to deploy, simple to extend, and require minimal infrastructure. If persistent storage is needed, SQLite must be used.

---

## 2. Goals

The product should allow developers and testers to:

1. Quickly create and release small testing pages in Astro.
2. Observe how AI agents interact with those pages.
3. Track useful technical data about requests and interactions.
4. Disable any individual test page from a protected admin area.
5. Review recent events and agent actions.
6. Maintain excellent accessibility across all public and admin pages.
7. Run with minimal dependencies and simple local or server deployment.

---

## 3. Non-Goals

The first version does not need to include:

1. A visual page builder.
2. Multi-user role management.
3. OAuth or SSO login.
4. Complex analytics dashboards.
5. Real-time collaboration.
6. Advanced bot detection or fingerprinting.
7. A large-scale database.
8. A/B testing logic.
9. Payment, billing, or subscription functionality.

---

## 4. Target Users

### Primary Users

Developers, researchers, QA testers, and product teams who want to test how agents interact with web pages.

### Secondary Users

Accessibility reviewers and UX researchers who want to observe whether agents can navigate accessible pages effectively.

---

## 5. Core Use Cases

### Use Case 1: Release a Small Testing Page

A developer creates a new Astro page for testing an agent flow, such as:

* A form submission page.
* A navigation-heavy page.
* A page with buttons, links, and ARIA labels.
* A page with hidden or disabled states.
* A page with instructions intended for an agent.

The page can be published quickly and made available under a public URL.

### Use Case 2: Track Agent Behaviour

When an agent or browser accesses a test page, the system records useful request and interaction data, including:

* Timestamp.
* URL.
* HTTP method.
* Request headers.
* User agent.
* Referrer.
* IP address, if available and legally acceptable.
* Response status.
* Response time.
* Page identifier.
* Session or request identifier.
* Interaction events, where available.
* Errors or failed requests.

### Use Case 3: Disable a Page

An admin opens the protected control area and disables a specific test page.

A disabled page should no longer be accessible publicly. Instead, it should return a clear disabled response, such as a 404, 410, or custom disabled page.

### Use Case 4: Review Recent Events

An admin opens the control area and sees recent events/actions, including page visits, interactions, response times, and errors.

---

## 6. Product Requirements

## 6.1 Public Test Pages

The application must support quickly releasing small testing pages.

Each test page should have:

* A unique route.
* A human-readable title.
* A description or purpose.
* An enabled/disabled status.
* Optional metadata.
* Accessible markup.
* Event tracking enabled by default.

Pages should be easy to add by creating new Astro page files or by registering them in a simple page manifest.

Example page metadata:

```ts
{
  id: "contact-form-test",
  title: "Contact Form Agent Test",
  path: "/tests/contact-form",
  description: "A simple form used to test agent form-filling behavior.",
  enabled: true
}
```

---

## 6.2 Tracking and Observability

Tracking is a core requirement.

The system must track request-level data for public pages and admin-relevant actions.

### Required Request Tracking Fields

Each request event should store:

* `id`
* `timestamp`
* `page_id`
* `url`
* `path`
* `method`
* `status_code`
* `response_time_ms`
* `user_agent`
* `referrer`
* `headers`
* `ip_address`, if available
* `request_id`
* `session_id`, if available
* `agent_hint`, if detectable
* `event_type`

### Required Event Types

The first version should support:

* `page_view`
* `page_disabled`
* `page_enabled`
* `admin_login_attempt`
* `admin_view`
* `form_submit`
* `button_click`
* `link_click`
* `error`

### Header Tracking

The system must capture request headers for analysis.

Because headers may contain sensitive data, the system should support a configurable allowlist/blocklist.

Default behavior:

* Store common analysis headers.
* Avoid storing sensitive headers such as `Authorization`, `Cookie`, and `Set-Cookie`.
* Allow developers to explicitly configure which headers are saved.

Recommended tracked headers:

* `User-Agent`
* `Accept`
* `Accept-Language`
* `Accept-Encoding`
* `Referer`
* `Host`
* `Origin`
* `Sec-Fetch-Site`
* `Sec-Fetch-Mode`
* `Sec-Fetch-Dest`
* `X-Forwarded-For`, if applicable
* `X-Request-ID`, if applicable

### Response Time Tracking

The system must measure and store response time in milliseconds for tracked requests.

---

## 6.3 Interaction Tracking

The system should include a small client-side tracking script for optional interaction events.

Tracked browser events may include:

* Button clicks.
* Link clicks.
* Form submissions.
* Input focus.
* Navigation attempts.
* JavaScript errors.

Each interaction event should include:

* Timestamp.
* Page ID.
* Event type.
* Element tag.
* Element text, if safe.
* Element label or accessible name, if available.
* Element ID or test identifier.
* Current URL.
* Session ID.
* User agent.

Accessibility-related labels are important because agents often rely on semantic structure and accessible names.

The client-side tracker should be lightweight and must not reduce page accessibility.

---

## 6.4 Accessibility Requirements

Accessibility is the highest priority.

All public test pages and the admin area must follow accessibility-first principles.

### Required Accessibility Standards

The application should target WCAG 2.2 AA where practical.

### Required Accessibility Features

All pages must include:

* Semantic HTML landmarks.
* Proper heading hierarchy.
* Keyboard navigability.
* Visible focus states.
* Descriptive page titles.
* Descriptive link text.
* Labels for all form fields.
* Accessible names for buttons and controls.
* Sufficient color contrast.
* No keyboard traps.
* No reliance on color alone.
* Skip-to-content link.
* Responsive layout.
* Reduced motion support where animation exists.
* Error messages connected to relevant fields.
* ARIA only where native HTML is insufficient.

### Testing Requirements

Before release, pages should be checked with:

* Keyboard-only navigation.
* Screen reader smoke testing.
* Automated accessibility checks.
* HTML validation where possible.

Recommended tools:

* axe.
* Lighthouse.
* Playwright accessibility checks.
* Manual keyboard testing.

---

## 6.5 Control/Admin Area

The application must include a closed control/admin area.

Example route:

```txt
/admin
```

The admin area must be protected with Basic Auth.

### Admin Area Requirements

The admin area must allow an authenticated admin to:

1. View all registered test pages.
2. See whether each page is enabled or disabled.
3. Disable any individual page.
4. Re-enable a disabled page.
5. View recent events/actions.
6. View request metadata for recent events.
7. See basic response time information.
8. See errors and failed requests.

### Basic Auth

The admin area must use Basic Auth as the first version authentication mechanism.

Credentials should be configured through environment variables:

```txt
ADMIN_USERNAME
ADMIN_PASSWORD
```

The password must not be hardcoded.

Failed admin login attempts should be tracked as events without storing the raw password.

---

## 6.6 Disable Every Single Page

Admins must be able to disable every public test page individually.

When a page is disabled:

* The public route should not show the active test page.
* The event should be logged.
* The admin UI should show the disabled state.
* The disabled state should persist across restarts.

Recommended disabled response:

```txt
HTTP 410 Gone
```

Alternative acceptable behavior:

```txt
HTTP 404 Not Found
```

The exact behavior should be configurable.

---

## 6.7 Recent Events / Actions View

The admin area must display recent events in reverse chronological order.

Each row should show:

* Timestamp.
* Event type.
* Page.
* URL/path.
* Status code.
* Response time.
* User agent summary.
* Agent hint, if available.
* IP address, if available.
* Details link or expandable metadata.

The first version can use a simple table.

The table must be accessible:

* Proper table headings.
* Keyboard-accessible expandable rows.
* Clear timestamp formatting.
* No hover-only interactions.

---

## 7. Technical Requirements

## 7.1 Framework

The application should be built with Astro.

Astro should be used for:

* Static or server-rendered test pages.
* Simple routing.
* Shared layouts.
* Accessible page templates.
* Admin area rendering.

If request tracking and Basic Auth are required at runtime, Astro should run in server mode using an adapter compatible with the deployment target.

---

## 7.2 Storage

If persistent storage is required, SQLite must be used.

SQLite should store:

* Registered page states.
* Request events.
* Interaction events.
* Admin actions.
* Error logs.

Recommended library options:

* `better-sqlite3`
* `drizzle-orm` with SQLite
* `kysely` with SQLite

The implementation should prefer simplicity.

---

## 7.3 Suggested Database Schema

### `pages`

```sql
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### `events`

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  event_type TEXT NOT NULL,
  page_id TEXT,
  url TEXT,
  path TEXT,
  method TEXT,
  status_code INTEGER,
  response_time_ms INTEGER,
  user_agent TEXT,
  referrer TEXT,
  ip_address TEXT,
  request_id TEXT,
  session_id TEXT,
  agent_hint TEXT,
  headers_json TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (page_id) REFERENCES pages(id)
);
```

### `admin_actions`

```sql
CREATE TABLE admin_actions (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_page_id TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);
```

---

## 7.4 Page Registry

The application should maintain a page registry or manifest.

Example:

```ts
export const testPages = [
  {
    id: "basic-navigation",
    title: "Basic Navigation Test",
    path: "/tests/basic-navigation",
    description: "Tests whether an agent can follow clear navigation links.",
  },
  {
    id: "form-submit",
    title: "Form Submit Test",
    path: "/tests/form-submit",
    description: "Tests whether an agent can complete a simple form.",
  }
];
```

The database should store runtime state such as `enabled` or `disabled`.

The source-controlled manifest should define available pages.

---

## 7.5 Tracking Middleware

The application should include middleware that:

1. Runs on public test page routes.
2. Starts a timer when a request begins.
3. Checks whether the requested page is enabled.
4. Captures selected request headers.
5. Allows the request to continue.
6. Captures response status and response time.
7. Writes an event to SQLite.

Pseudo-flow:

```txt
Request received
→ Generate request ID
→ Match route to registered test page
→ Check enabled state
→ If disabled, return disabled response
→ Render page
→ Measure response time
→ Store event
→ Return response
```

---

## 7.6 Client-Side Event Tracking Endpoint

The application should provide an endpoint such as:

```txt
POST /api/events
```

The endpoint should accept interaction events from public pages.

It should:

* Validate payload shape.
* Reject oversized payloads.
* Sanitize text values.
* Store event data in SQLite.
* Return a simple success response.

Example payload:

```json
{
  "event_type": "button_click",
  "page_id": "form-submit",
  "url": "https://example.com/tests/form-submit",
  "element": {
    "tag": "button",
    "text": "Submit",
    "accessible_name": "Submit form",
    "id": "submit-button"
  },
  "session_id": "anonymous-session-id"
}
```

---

## 8. Security and Privacy Requirements

### Basic Auth

Admin routes must be protected by Basic Auth.

### Sensitive Data Handling

The system must not store:

* Raw Basic Auth credentials.
* Password fields submitted in forms.
* Cookies by default.
* Authorization headers by default.
* Full request bodies by default.

### Header Storage

Headers should be filtered before storage.

Sensitive headers must be excluded by default.

### Admin Protection

All `/admin` routes and admin actions must require Basic Auth.

### Input Validation

The event endpoint must validate and sanitize input.

### Rate Limiting

A simple rate limit should be considered for:

* `/api/events`
* `/admin`
* Public test pages if abuse becomes a concern.

For version 1, a lightweight in-memory rate limit is acceptable.

---

## 9. Performance Requirements

The application should be lightweight and fast.

### Target Performance

* Public pages should respond in under 300 ms locally.
* Tracking should add minimal overhead.
* Admin event views should load quickly for the latest 100–500 events.
* SQLite writes should be simple and indexed.

### Recommended Indexes

```sql
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_page_id ON events(page_id);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_request_id ON events(request_id);
```

---

## 10. Admin UI Requirements

The admin UI should include the following views.

### 10.1 Dashboard

Shows:

* Total pages.
* Enabled pages.
* Disabled pages.
* Recent event count.
* Recent errors.
* Slowest recent response times.

### 10.2 Pages View

Shows:

* Page title.
* Path.
* Description.
* Current status.
* Disable/enable action.

### 10.3 Events View

Shows recent events with filters.

Useful filters:

* Page.
* Event type.
* Status code.
* Agent hint.
* Time range.

### 10.4 Event Detail View

Shows:

* Request metadata.
* Headers, after filtering.
* Response time.
* User agent.
* Referrer.
* Interaction metadata.
* Related page.

---

## 11. Accessibility Requirements for Admin UI

The admin UI must be fully accessible.

Required behavior:

* All controls must be keyboard accessible.
* Toggle buttons must expose state using semantic controls or appropriate ARIA.
* Tables must use proper headings and captions.
* Forms must have labels and clear error messages.
* Status changes must be announced where appropriate.
* Focus must move predictably after actions.
* No icon-only buttons without accessible names.
* Admin forms must work without JavaScript where practical.

---

## 12. Suggested First Test Pages

Version 1 should include a small set of example pages:

### 12.1 Basic Navigation Page

Purpose: Test whether an agent can follow clear links.

Includes:

* Page heading.
* Several links.
* A clear target instruction.
* Semantic navigation.

### 12.2 Simple Form Page

Purpose: Test whether an agent can fill and submit a form.

Includes:

* Text input.
* Email input.
* Select field.
* Checkbox.
* Submit button.
* Accessible validation errors.

### 12.3 Button Interaction Page

Purpose: Test whether an agent can click buttons and understand state changes.

Includes:

* Several clearly labeled buttons.
* Dynamic state text.
* ARIA live region for updates.

### 12.4 Content Extraction Page

Purpose: Test whether an agent can find and extract specific information.

Includes:

* Structured content.
* Headings.
* Lists.
* Tables.
* Clear accessible labels.

### 12.5 Disabled State Page

Purpose: Test whether disabled page behavior works.

Includes:

* A page that can be disabled from the admin area.
* Logged disabled access attempts.

---

## 13. Release Plan

### Version 0.1: Minimum Viable Playground

Includes:

* Astro app setup.
* Public test page routing.
* Page registry.
* SQLite database.
* Request tracking middleware.
* Basic Auth-protected admin area.
* Page enable/disable functionality.
* Recent events table.
* At least three test pages.
* Basic accessibility checklist.

### Version 0.2: Improved Observability

Adds:

* Event detail view.
* Interaction tracking script.
* Header allowlist/blocklist configuration.
* Filters for events.
* Better agent hint detection.
* Error tracking.

### Version 0.3: Better Testing Workflow

Adds:

* More reusable test page templates.
* Export recent events as JSON or CSV.
* Accessibility test automation.
* Optional visual charts.
* Improved documentation for creating new pages.

---

## 14. Acceptance Criteria

### Public Pages

* A developer can add a new test page quickly.
* Public test pages render correctly in Astro.
* Pages use semantic, accessible HTML.
* Page visits are logged.
* Response time is tracked.
* Request headers are filtered and stored.

### Admin Area

* `/admin` requires Basic Auth.
* Admin credentials are configured through environment variables.
* Admin can view all pages.
* Admin can disable and enable each page.
* Disabled state persists.
* Admin can view recent events/actions.
* Admin actions are logged.

### Tracking

* Page views are tracked.
* URL, headers, user agent, status, and response time are tracked.
* Client-side interactions can be tracked.
* Sensitive headers are not stored by default.
* Tracking failures do not break public pages.

### Accessibility

* Pages are keyboard navigable.
* Forms have labels.
* Buttons have accessible names.
* Focus states are visible.
* Admin tables are accessible.
* Automated accessibility checks pass with no serious violations.

---

## 15. Open Questions

1. Should disabled pages return `404`, `410`, or a custom disabled page?
2. Should event tracking include IP addresses by default, or should this be configurable?
3. Should test pages be created only in code, or should the admin area eventually support creating them?
4. Should the app support static deployment, or is server deployment acceptable from the start?
5. Which Astro adapter should be used for the target hosting environment?
6. Should the tracking script be enabled on all test pages by default?
7. Should event data have automatic retention, such as deleting events older than 30 days?

---

## 16. Recommended Implementation Stack

* Framework: Astro
* Runtime mode: Astro SSR
* Database: SQLite
* SQLite library: `better-sqlite3`
* Styling: Plain CSS or minimal utility CSS
* Auth: Basic Auth middleware
* Testing: Playwright
* Accessibility testing: axe-core / Playwright integration
* Deployment: Any Node-compatible host with persistent SQLite storage

---

## 17. Summary

The Agent Playground should be a small, fast, accessible Astro application for publishing test pages and observing how AI agents interact with them.

The first release should prioritize:

1. Fast page release workflow.
2. Strong accessibility.
3. Reliable request and interaction tracking.
4. SQLite-backed persistence.
5. Basic Auth-protected admin controls.
6. Simple enable/disable management for every test page.
7. Recent event visibility.

The product should remain intentionally lightweight so teams can quickly create new testing pages and learn from real agent behavior.
