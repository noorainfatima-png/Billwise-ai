import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { BillingRecord, INITIAL_BILLING_HISTORY } from "./data/mockData";
import { Dashboard } from "./pages/Dashboard";

export default function App() {
  const [history, setHistory] = useState<BillingRecord[]>(INITIAL_BILLING_HISTORY);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard history={history} />} />
          <Route
            path="/scan"
            element={
              <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] p-6 text-sm text-[#52525B]">
                Bill Scanner route ready. Set records: {history.length}.
              </div>
            }
          />
          <Route
            path="/simulator"
            element={
              <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] p-6 text-sm text-[#52525B]">
                Appliance Simulator route ready.
              </div>
            }
          />
          <Route
            path="/history"
            element={
              <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-[6px] p-6 text-sm text-[#52525B]">
                Billing Ledger route ready ({history.length} months).
              </div>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
