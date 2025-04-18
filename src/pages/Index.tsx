
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockBusinessProfile } from "@/lib/mockData";
import Dashboard from "./Dashboard";

const Index = () => {
  const navigate = useNavigate();
  const isOnboarded = mockBusinessProfile.isOnboarded;

  useEffect(() => {
    if (!isOnboarded) {
      navigate("/onboarding");
    }
  }, [isOnboarded, navigate]);

  if (!isOnboarded) {
    return null;
  }

  return <Dashboard />;
};

export default Index;
