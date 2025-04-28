export const TEST_CONTRACTS = {
  simple: {
    name: "Simple Service Agreement",
    content: `SERVICE AGREEMENT

This Service Agreement (the "Agreement") is made effective as of April 1, 2025, by and between:

ABC Tech Solutions, Inc., a Delaware corporation with offices at 123 Main Street, San Francisco, CA 94105 ("Provider")
and
XYZ Corp., a California corporation with offices at 456 Market Street, San Francisco, CA 94105 ("Client").

1. SERVICES
Provider agrees to provide web development services as described in Exhibit A ("Services").

2. PAYMENT
Client agrees to pay $10,000 per month for the Services, payable within 30 days of invoice.

3. TERM
This Agreement shall commence on April 1, 2025 and continue for 12 months.

4. TERMINATION
Either party may terminate with 30 days written notice.

5. GOVERNING LAW
This Agreement shall be governed by California law.`,
    expectedResult: {
      overallRisk: "low",
      keyInformation: {
        parties: [
          { name: "ABC Tech Solutions, Inc.", type: "organization" },
          { name: "XYZ Corp.", type: "organization" }
        ],
        startDate: "2025-04-01",
        endDate: "2026-03-31",
        value: "120000",
        governingLaw: "California",
        criticalDates: [
          {
            description: "Agreement Start Date",
            date: "2025-04-01"
          },
          {
            description: "Agreement End Date",
            date: "2026-03-31"
          }
        ]
      },
      standardClauses: ["term", "payment", "termination", "governing_law"]
    }
  },

  complex: {
    name: "Complex SaaS Agreement",
    content: `MASTER SOFTWARE AS A SERVICE AGREEMENT

This Master Software as a Service Agreement ("Agreement") is entered into as of May 1, 2025 ("Effective Date") by and between:

CloudTech Solutions Ltd., a UK private limited company with registered office at 10 Tech Lane, London, EC1A 1BB ("Provider")
and
Global Enterprise Inc., a Delaware corporation with principal place of business at 789 Corporate Drive, New York, NY 10001 ("Customer").

1. DEFINITIONS
"Service Level Agreement" or "SLA" means the service levels described in Exhibit B.
"Subscription Fee" means the fees set forth in Exhibit A.

2. SERVICES AND LICENSE
2.1 Provider grants Customer a non-exclusive, non-transferable license to use the Software.
2.2 Provider shall maintain 99.9% uptime as per the SLA.

3. FEES AND PAYMENT
3.1 Customer shall pay annual Subscription Fees of $500,000.
3.2 Fees increase by 5% annually.
3.3 Payment terms: Net 45.

4. TERM AND TERMINATION
4.1 Initial term of 36 months from Effective Date.
4.2 Auto-renewal for 12-month periods unless notice given 90 days prior.
4.3 Provider may terminate immediately for payment default.

5. DATA PROTECTION
5.1 Provider shall comply with GDPR and maintain ISO 27001 certification.
5.2 Security incidents must be reported within 24 hours.

6. LIABILITY
6.1 Provider's liability capped at 12 months of fees.
6.2 Excludes gross negligence or willful misconduct.

7. GOVERNING LAW AND JURISDICTION
7.1 Governed by English law.
7.2 Courts of England have exclusive jurisdiction.`,
    expectedResult: {
      overallRisk: "medium",
      keyInformation: {
        parties: [
          { name: "CloudTech Solutions Ltd.", type: "organization" },
          { name: "Global Enterprise Inc.", type: "organization" }
        ],
        startDate: "2025-05-01",
        endDate: "2028-04-30",
        value: "1500000",
        governingLaw: "England",
        criticalDates: [
          {
            description: "Agreement Start Date",
            date: "2025-05-01"
          },
          {
            description: "Initial Term End Date",
            date: "2028-04-30"
          },
          {
            description: "Renewal Notice Deadline",
            date: "2028-01-30"
          }
        ]
      },
      standardClauses: [
        "term",
        "payment",
        "termination",
        "governing_law",
        "liability",
        "data_protection"
      ]
    }
  }
};

export const TEST_CLAUSES = {
  standard: [
    {
      name: "Governing Law",
      content: "This Agreement shall be governed by the laws of California.",
      expectation: {
        detected: true,
        governingLaw: "California"
      }
    },
    {
      name: "Term",
      content: "This Agreement shall commence on June 1, 2025 and continue for 24 months.",
      expectation: {
        detected: true,
        startDate: "2025-06-01",
        endDate: "2027-05-31"
      }
    }
  ],
  nonStandard: [
    {
      name: "Unusual Termination",
      content: "This Agreement shall terminate automatically if Provider's stock price falls below $10.",
      expectation: {
        riskLevel: "high",
        flagged: true
      }
    }
  ]
};

export const TEST_SCENARIOS = {
  missingClauses: {
    content: "Simple agreement without standard clauses...",
    expectedFlags: ["governing_law", "term", "termination"]
  },
  conflictingClauses: {
    content: `
    5.1 This Agreement shall be governed by California law.
    ...
    8.3 This Agreement shall be governed by New York law.
    `,
    expectedFlags: ["conflicting_governing_law"]
  }
};
