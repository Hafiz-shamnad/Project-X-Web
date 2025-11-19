"use client";

import { useRouter } from "next/navigation";
import { useUser } from "../hooks/useUser";
import LoadingScreen from "../components/LoadingScreen";
import ProjectXCTF from "./ProjectXCTF";

export default function DashboardClient() {
  const router = useRouter();
  const { user, loading } = useUser();

  if (loading) return <LoadingScreen />;

  if (!user) {
    router.replace("/login");
    return null;
  }

  return <ProjectXCTF/>;
}
