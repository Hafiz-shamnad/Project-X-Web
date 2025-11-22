"use client";

import DashboardPanel from "./DashboardPanel";
import AuthGuard from "../components/AuthGuard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardPanel />
    </AuthGuard>
  );
}
