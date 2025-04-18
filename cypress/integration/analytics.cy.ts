
describe("Analytics Dashboard", () => {
  beforeEach(() => {
    // Mock login state
    cy.intercept("GET", "/api/auth/me", { 
      statusCode: 200, 
      body: {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "admin"
      }
    });

    // Mock performance metrics API
    cy.intercept("GET", "/api/businesses/*/analytics/performance*", {
      statusCode: 200,
      fixture: "performanceMetrics.json", // Create a fixture file with mock data
      body: {
        dateRange: "2025-04-01 – 2025-04-30",
        kpis: {
          spend: 4523.87,
          roas: 3.42,
          cpl: 27.15,
          ctr: 1.12
        },
        daily: [
          { 
            date: "2025-04-01",
            spend: 120.45,
            impressions: 10000,
            clicks: 120,
            leads: 5,
            ctr: 1.2,
            cpl: 24.09,
            roas: 3.1
          },
          { 
            date: "2025-04-02",
            spend: 130.50,
            impressions: 11000,
            clicks: 130,
            leads: 6,
            ctr: 1.18,
            cpl: 21.75,
            roas: 3.2
          }
        ],
        totals: {
          impressions: 21000,
          clicks: 250,
          spend: 250.95,
          leads: 11,
          ctr: 1.19,
          cpl: 22.81
        }
      }
    }).as("getPerformanceMetrics");

    // Mock insights API
    cy.intercept("GET", "/api/businesses/*/analytics/insights", {
      statusCode: 200,
      fixture: "insights.json", // Create a fixture file with mock data
      body: {
        patternInsights: [
          {
            element: "Call to action button",
            elementType: "component",
            performance: {
              uplift: 0.23,
              withElement: {
                ctr: 0.018,
                sampleSize: 150
              },
              withoutElement: {
                ctr: 0.014,
                sampleSize: 120
              },
              confidence: 0.92
            }
          },
          {
            element: "Product image",
            elementType: "visual",
            performance: {
              uplift: 0.18,
              withElement: {
                ctr: 0.017,
                sampleSize: 140
              },
              withoutElement: {
                ctr: 0.014,
                sampleSize: 130
              },
              confidence: 0.88
            }
          }
        ]
      }
    }).as("getInsights");

    cy.visit("/analytics");
    cy.wait(["@getPerformanceMetrics", "@getInsights"]);
  });

  it("renders the KPI cards with correct values", () => {
    cy.contains("Total Spend").should("exist");
    cy.contains("$4,523.87").should("exist");
    
    cy.contains("ROAS").should("exist");
    cy.contains("3.42").should("exist");
    
    cy.contains("CPL").should("exist");
    cy.contains("$27.15").should("exist");
    
    cy.contains("CTR").should("exist");
    cy.contains("1.12%").should("exist");
  });

  it("renders the performance chart", () => {
    cy.get("canvas").should("exist");
  });

  it("navigates to insights tab and displays data", () => {
    cy.contains("Patterns & Insights").click();
    cy.contains("Top Performing Patterns").should("exist");
    cy.contains("Call to action button").should("exist");
    cy.contains("+23.00%").should("exist");
  });

  it("changes the timeframe when selecting a different period", () => {
    cy.intercept("GET", "/api/businesses/*/analytics/performance?days=7*", {
      statusCode: 200,
      body: {
        // Mock data for 7 day period
        dateRange: "2025-04-23 – 2025-04-30",
        kpis: {
          spend: 1523.87,
          roas: 2.98,
          cpl: 31.15,
          ctr: 0.92
        },
        daily: [
          // 7 days of data...
        ],
        totals: {
          impressions: 7000,
          clicks: 90,
          spend: 90.45,
          leads: 3,
          ctr: 1.29,
          cpl: 30.15
        }
      }
    }).as("get7DayData");
    
    cy.contains("7 Days").click();
    cy.wait("@get7DayData");
    
    cy.url().should("include", "days=7");
  });
  
  it("handles empty data gracefully", () => {
    cy.intercept("GET", "/api/businesses/*/analytics/performance?days=90*", {
      statusCode: 200,
      body: {
        dateRange: "2025-01-30 – 2025-04-30",
        kpis: {
          spend: 0,
          roas: 0,
          cpl: 0,
          ctr: 0
        },
        daily: [],
        totals: {
          impressions: 0,
          clicks: 0,
          spend: 0,
          leads: 0,
          ctr: 0,
          cpl: 0
        }
      }
    }).as("getEmptyData");
    
    cy.contains("90 Days").click();
    cy.wait("@getEmptyData");
    
    cy.contains("No performance data available yet").should("exist");
    cy.contains("Charts will display once at least one day of performance data is ingested").should("exist");
  });
});
