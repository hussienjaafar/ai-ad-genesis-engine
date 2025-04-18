
import { render, screen } from "@testing-library/react";
import KpiCard from "../KpiCard";

describe("KpiCard Component", () => {
  it("renders currency value correctly", () => {
    render(
      <KpiCard
        title="Total Spend"
        value={1234.56}
        change={5.2}
        unit="currency"
        currency="USD"
      />
    );
    
    expect(screen.getByText("Total Spend")).toBeInTheDocument();
    expect(screen.getByText("$1,234.56")).toBeInTheDocument();
    expect(screen.getByText("5.2%")).toBeInTheDocument();
  });
  
  it("renders percentage value correctly", () => {
    render(
      <KpiCard
        title="CTR"
        value={2.45}
        change={-1.8}
        unit="percentage"
      />
    );
    
    expect(screen.getByText("CTR")).toBeInTheDocument();
    expect(screen.getByText("2.45%")).toBeInTheDocument();
    expect(screen.getByText("1.8%")).toBeInTheDocument();
  });
  
  it("shows negative change in red when negative is good", () => {
    const { container } = render(
      <KpiCard
        title="CPL"
        value={12.34}
        change={-3.5}
        unit="currency"
        isPositiveGood={false}
      />
    );
    
    const changeElement = container.querySelector(".text-green-600");
    expect(changeElement).toBeInTheDocument();
  });
  
  it("shows positive change in green when positive is good", () => {
    const { container } = render(
      <KpiCard
        title="ROAS"
        value={3.42}
        change={2.1}
        unit="number"
        isPositiveGood={true}
      />
    );
    
    const changeElement = container.querySelector(".text-green-600");
    expect(changeElement).toBeInTheDocument();
  });
});
