import React, { useState } from "react";
import { Button } from "antd";

import SchedulePage from "./pages/Schedule";
import StaffPage from "./pages/Staff";
import ServicesPage from "./pages/Services";

const App: React.FC = () => {
  const [displayView, setDisplayView] = useState<
    "schedule" | "staff" | "services"
  >("schedule");

  return (
    <div>
      <div className="header-btn">
        <Button
          className={`hdr-btn ${
            displayView === "schedule" ? "active-btn" : ""
          }`}
          type="text"
          onClick={() => setDisplayView("schedule")}
        >
          Schedule
        </Button>
        <Button
          className={`hdr-btn ${displayView === "staff" ? "active-btn" : ""}`}
          onClick={() => setDisplayView("staff")}
        >
          Staff
        </Button>
        <Button
          className={`hdr-btn ${displayView === "services" ? "active-btn" : ""}`}
          onClick={() => setDisplayView("services")}
        >
          Services
        </Button>
      </div>
      {displayView === "schedule" && <SchedulePage />}
      {displayView === "staff" && <StaffPage />}
      {displayView === "services" && <ServicesPage />}
    </div>
  );
};

export default App;
