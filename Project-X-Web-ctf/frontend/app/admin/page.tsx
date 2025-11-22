"use client";

import AdminPanel from "./AdminPanel";
import AuthGuard from "../components/AuthGuard";

export default function AdminPage() {
  return (
    <AuthGuard adminOnly={true}>
      <AdminPanel />
    </AuthGuard>
  );
}
