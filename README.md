# Doctor Mortgage Finder

A pure static, high-converting physician loan landing page rebuilt and fully optimized according to the **Google Ads Physician Mortgage Campaign Plan** (September 2026).

---

## ⚡ Zero Backend Setup — Form to Email

This site is **100% static** (no Node backend or database required). All leads are captured and delivered directly to your email inbox!

### How to Set Your Destination Email:
Open [config.js](file:///Users/apple/.gemini/antigravity/scratch/dr-mortgage-finder/config.js) and set your email address:
```javascript
window.CONFIG = {
  notificationEmail: "your-email@example.com", // <-- PUT YOUR EMAIL HERE
  // ...
};
```

When a doctor submits their inquiry:
- An email is automatically dispatched via secure AJAX to your inbox.
- It contains a formatted summary table with:
  - Borrower Name, Phone, and Email
  - Profession (MD/DO, Dentist, Resident/Fellow)
  - Target State, Financing Goal, and Timeline
  - Full Google Ads attribution (`gclid`, `gbraid`, `wbraid`, `utm_source`, `utm_campaign`, `utm_term`)
  - Timestamp and submission page URL

*(Note: The very first time you submit with a new email, FormSubmit sends a 1-click confirmation link to activate the inbox. After that, every lead arrives immediately).*

---

## 🎯 Google Ads Sitelinks & Tracking Compliance

### Sitelink Anchors
- `#options-form` $\to$ 3-Step Physician Mortgage Lead Funnel
- `#how-it-works` $\to$ 3-Step Matching Process
- `#eligible-professionals` $\to$ Medical Career Benefit Cards
- `#faq` $\to$ Expandable FAQ Accordion

### Analytics & Conversions
- **Primary Conversion (`lead_form_submit`)**: Value `$25 USD`, fires only on verified email transmission.
- **Secondary Conversions**: `form_start` ($0), `step_completion` ($0), and `phone_click` ($0).
- **Attribution**: Automatically stores and passes `gclid`, `gbraid`, `wbraid`, and all UTM parameters.

---

## 🚀 Preview Locally

```bash
cd /Users/apple/.gemini/antigravity/scratch/dr-mortgage-finder
python3 -m http.server 8080
```
Open **[http://localhost:8080](http://localhost:8080)**.
