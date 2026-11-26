import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { BillingRecord, INITIAL_BILLING_HISTORY } from "./data/mockData";
import { Dashboard } from "./pages/Dashboard";
import { BillScanner } from "./pages/BillScanner";
import { Simulator } from "./pages/Simulator";
import { History } from "./pages/History";

export default function App() {
  const [history, setHistory] = useState<BillingRecord[]>(INITIAL_BILLING_HISTORY);

  function handleAddRecord(record: BillingRecord) {
    setHistory((prev) => [record, ...prev]);
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard history={history} />} />
          <Route path="/scan" element={<BillScanner onAddRecord={handleAddRecord} />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/history" element={<History history={history} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}