"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

import AdminHeader from "./components/AdminHeader";
import AdminTabs from "./components/AdminTabs";
import ChallengeCreate from "./components/ChallengeCreate";
import ChallengeManage from "./components/ChallengeManage";
import TeamManager from "./components/TeamManager";
import LeaderboardPanel from "./components/LeaderboardPanel";
import AnnouncementCreate from "./components/AnnouncementCreate";

import ConfirmModal from "../components/ConfirmModal";
import InputModal from "../components/InputModal";

import { useChallenges } from "./hooks/useChallenges";
import { useTeams } from "./hooks/useTeams";
import { useAdminModals } from "./hooks/useAdminModals";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<
    "create" | "manage" | "leaderboard" | "teams" | "announcement"
  >("create");

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  const { confirm, input, openConfirm, openInput, closeConfirm, closeInput } =
    useAdminModals();

  const {
    challenges,
    fetchChallenges,
    createChallenge,
    deleteChallenge,
    toggleRelease,
    loading: challengesLoading,
  } = useChallenges();

  const {
    teams,
    fetchTeams,
    banTeam,
    unbanTeam,
    applyPenalty,
    loading: teamsLoading,
  } = useTeams();

  useEffect(() => {
    fetchChallenges().catch(() => showError("Failed to load challenges"));
    fetchTeams().catch(() => showError("Failed to load teams"));
  }, []);

  const AnnouncementPage = useMemo(
    () => (
      <AnnouncementCreate
        onSuccess={() => showSuccess("Announcement created.")}
        onError={() => showError("Failed to create announcement.")}
      />
    ),
    []
  );

  const CreatePage = useMemo(
    () => (
      <ChallengeCreate
        onCreate={async (fd) => {
          try {
            await createChallenge(fd);
            showSuccess("Challenge created");
          } catch {
            showError("Failed");
          }
        }}
      />
    ),
    [createChallenge]
  );

  const ManagePage = useMemo(
    () => (
      <ChallengeManage
        challenges={challenges}
        loading={challengesLoading}
        onToggleRelease={async (id, current) => {
          await toggleRelease(id, !current);
          showSuccess(current ? "Hidden" : "Released");
        }}
        onDelete={(id, name) =>
          openConfirm("Delete Challenge", `Delete "${name}"?`, async () => {
            await deleteChallenge(id);
            showSuccess("Deleted");
          })
        }
        onBulkRelease={(ids) => Promise.resolve()}
        onBulkHide={(ids) => Promise.resolve()}
        onBulkDelete={(ids) => Promise.resolve()}
        showSuccess={showSuccess}
        showError={showError}
      />
    ),
    [challenges, challengesLoading]
  );

  const TeamsPage = useMemo(
    () => (
      <TeamManager
        teams={teams}
        loading={teamsLoading}
        openConfirm={openConfirm}
        openInput={openInput}
        onTemporaryBan={async (id, mins) => {
          await banTeam(id, mins);
          showSuccess("Temporary ban applied.");
        }}
        onPermanentBan={async (id) => {
          await banTeam(id, 0);
          showSuccess("Permanent ban applied.");
        }}
        onUnban={async (id) => {
          await unbanTeam(id);
          showSuccess("Team unbanned.");
        }}
        onPenalty={async (id, pts) => {
          await applyPenalty(id, pts);
          showSuccess("Penalty applied.");
        }}
      />
    ),
    [teams, teamsLoading]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-gray-100">
      {(successMsg || errorMsg) && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 rounded-lg shadow-xl backdrop-blur-md border
            ${
              successMsg
                ? "bg-green-600/10 border-green-500 text-green-300"
                : "bg-red-600/10 border-red-500 text-red-300"
            }`}
        >
          {successMsg || errorMsg}
        </div>
      )}

      <AdminHeader
        challengeCount={challenges.length}
        teamCount={teams.length}
      />

      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-6xl mx-auto p-8 space-y-10">
        {activeTab === "create" && CreatePage}
        {activeTab === "manage" && ManagePage}
        {activeTab === "leaderboard" && <LeaderboardPanel />}
        {activeTab === "teams" && TeamsPage}
        {activeTab === "announcement" && AnnouncementPage}
      </main>

      {/* Modals */}
      <ConfirmModal
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmText="Confirm"
        cancelText="Cancel"
        variant={confirm.variant} // ← ADD THIS
        onConfirm={async () => {
          await confirm.onConfirm();
          closeConfirm();
        }}
        onCancel={closeConfirm}
      />

      <InputModal
        isOpen={input.open}
        title={input.title}
        message={input.message}
        label={input.label}
        onConfirm={async (v) => {
          await input.onConfirm(v);
          closeInput();
        }}
        onCancel={closeInput}
      />
    </div>
  );
}
