import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedShell } from "./components/layout/ProtectedShell";
import { HomePage } from "./features/home/page";
import { DashboardPage } from "./features/dashboard/page";
import { TransactionsPage } from "./features/transactions/page";
import { CategoriesPage } from "./features/categories/page";
import { BudgetsPage } from "./features/budgets/page";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<ProtectedShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
