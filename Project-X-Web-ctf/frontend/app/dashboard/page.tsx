// SERVER COMPONENT
export const dynamic = "force-dynamic";
export const revalidate = 0;

import DashboardPageClient from "./DashboardPageClient";

export default function DashboardPage() {
  return <DashboardPageClient />;
}
