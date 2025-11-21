"use client";

import { useEffect, useState, useCallback } from "react";

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

  /* ------------------------ Notifications ------------------------ */
  const showSuccess = useCallback((msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 2500);
  }, []);

  const showError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  }, []);

  /* ------------------------ Modals (confirm/input) ------------------------ */
  const { confirm, input, openConfirm, openInput, closeConfirm, closeInput } =
    useAdminModals();

  /* ------------------------ Data Hooks ------------------------ */
  const {
    challenges,
    fetchChallenges,
    createChallenge,
    deleteChallenge,
    toggleRelease,
    bulkRelease,
    bulkHide,
    bulkDelete,
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

  /* ------------------------ Initial Load ------------------------ */
  useEffect(() => {
    fetchChallenges().catch(() => showError("Failed to load challenges"));
    fetchTeams().catch(() => showError("Failed to load teams"));
  }, [fetchChallenges, fetchTeams, showError]);

  /* ------------------------ Render ------------------------ */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-gray-100">
      {/* Toasts */}
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

      <AdminHeader challengeCount={challenges.length} teamCount={teams.length} />

      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-6xl mx-auto p-8 space-y-10">
        {/* CREATE TAB */}
        {activeTab === "create" && (
          <ChallengeCreate
            onCreate={async (fd) => {
              try {
                await createChallenge(fd);
                showSuccess("Challenge created");
              } catch {
                showError("Failed to create challenge");
              }
            }}
          />
        )}

        {/* MANAGE TAB */}
        {activeTab === "manage" && (
          <ChallengeManage
            challenges={challenges}
            loading={challengesLoading}
            // currentState = existing released value
            onToggleRelease={async (id, currentState) => {
              await toggleRelease(id, currentState);
              showSuccess(currentState ? "Hidden" : "Released");
            }}
            onDelete={(id, name) =>
              openConfirm(
                "Delete Challenge",
                `Delete "${name}"?`,
                async () => {
                  await deleteChallenge(id);
                  showSuccess("Challenge deleted.");
                },
                "danger"
              )
            }
            onBulkRelease={async (ids) => {
              await bulkRelease(ids);
              showSuccess("Selected challenges released.");
            }}
            onBulkHide={async (ids) => {
              await bulkHide(ids);
              showSuccess("Selected challenges hidden.");
            }}
            onBulkDelete={async (ids) => {
              await bulkDelete(ids);
              showSuccess("Selected challenges deleted.");
            }}
            showSuccess={showSuccess}
            showError={showError}
          />
        )}

        {/* TEAMS TAB */}
        {activeTab === "teams" && (
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
        )}

        {/* ANNOUNCEMENT TAB */}
        {activeTab === "announcement" && (
          <AnnouncementCreate
            onSuccess={() => showSuccess("Announcement created.")}
            onError={() => showError("Failed to create announcement.")}
          />
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === "leaderboard" && <LeaderboardPanel />}
      </main>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        variant={confirm.variant}
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={async () => {
          await confirm.onConfirm();
          closeConfirm();
        }}
        onCancel={closeConfirm}
      />

      {/* Input Modal */}
      <InputModal
        isOpen={input.open}
        title={input.title}
        message={input.message}
        label={input.label}
        onConfirm={async (val) => {
          await input.onConfirm(val);
          closeInput();
        }}
        onCancel={closeInput}
      />
    </div>
  );
}
