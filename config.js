/**
 * DrMortgageFinder - Central Configuration
 * Update these settings to match your company licensing, contact information,
 * and the email address where you want to receive new leads.
 */

window.CONFIG = {
  // 1. Where should submitted leads be emailed?
  // Enter the email address that will receive every borrower inquiry:
  notificationEmail: "Shanebbacker@gmail.com",

  // 2. Company & Originator Licensing (PDF Section 1, 14, 16)
  companyName: "DrMortgageFinder, LLC",
  companyNmls: "1234567",
  originatorName: "Shane Backer",
  originatorNmls: "7654321",
  
  // 3. Real Contact Information
  phone: "(800) 555-0199",
  phoneRaw: "+18005550199",
  email: "Shanebbacker@gmail.com",
  address: "100 Medical Center Way, Suite 400, Chicago, IL 60611",

  // 4. Google Tag Manager / Google Ads IDs (PDF Section 1 & 4)
  gtmId: "", 
  googleAdsId: "",

  // 5. Active Licensed States (PDF Section 1 & 3: Only target states with active licenses)
  licensedStates: [
    "Arizona",
    "Colorado",
    "Connecticut",
    "Florida",
    "Indiana",
    "Maryland",
    "Michigan",
    "Minnesota",
    "Missouri",
    "New Jersey",
    "Ohio",
    "Pennsylvania",
    "South Carolina",
    "Tennessee",
    "Texas",
    "Virginia",
    "Washington",
    "West Virginia",
    "Other / Out of State"
  ]
};
