"use client";

import { useEffect, useState, useCallback } from "react";

import AdminHeader from "./components/AdminHeader";
import AdminTabs from "./components/AdminTabs";
import ChallengeCreate from "./components/ChallengeCreate";
import ChallengeManage from "./components/ChallengeManage";
import TeamManager from "./components/TeamManager";
import LeaderboardPanel from "./components/LeaderboardPanel";

import ConfirmModal from "../components/ConfirmModal";
import InputModal from "../components/InputModal";

import { useChallenges } from "./hooks/useChallenges";
import { useTeams } from "./hooks/useTeams";
import { useAdminModals } from "./hooks/useAdminModals";

export default function AdminPanel() {
  const [activeTab, setActiveTab] =
    useState<"create" | "manage" | "leaderboard" | "teams">("create");

  // Toasts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showSuccess = useCallback((m: string) => {
    setSuccessMsg(m);
    setTimeout(() => setSuccessMsg(null), 3500);
  }, []);

  const showError = useCallback((m: string) => {
    setErrorMsg(m);
    setTimeout(() => setErrorMsg(null), 5000);
  }, []);

  // Data hooks
  const {
    challenges,
    loading: challengesLoading,
    fetchChallenges,
    createChallenge,
    deleteChallenge,
    toggleRelease,
  } = useChallenges();

  const {
    teams,
    loading: teamsLoading,
    fetchTeams,
    banTeam,
    unbanTeam,
    applyPenalty,
  } = useTeams();

  // Modals
  const {
    confirm,
    input,
    openConfirm,
    openInput,
    closeConfirm,
    closeInput,
  } = useAdminModals();

  // Initial load
  useEffect(() => {
    fetchChallenges().catch(() => showError("Failed to load challenges."));
    fetchTeams().catch(() => showError("Failed to load teams."));
  }, [fetchChallenges, fetchTeams, showError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 text-gray-100">
      {/* Toasts */}
      {(successMsg || errorMsg) && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg border backdrop-blur-md shadow-lg ${
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
        {activeTab === "create" && (
          <ChallengeCreate
            onCreate={async (fd) => {
              try {
                await createChallenge(fd);
                showSuccess("Challenge created successfully.");
              } catch (e) {
                console.error(e);
                showError("Failed to create challenge.");
              }
            }}
          />
        )}

        {activeTab === "manage" && (
          <ChallengeManage
            challenges={challenges}
            loading={challengesLoading}
            onToggleRelease={async (id, currentState) => {
              try {
                await toggleRelease(id, !currentState);
                showSuccess(
                  currentState ? "Challenge hidden." : "Challenge released."
                );
              } catch (e) {
                console.error(e);
                showError("Failed to update release state.");
              }
            }}
            onDelete={(id, name) =>
              openConfirm(
                "Delete Challenge",
                `Delete "${name}"? This cannot be undone.`,
                async () => {
                  try {
                    await deleteChallenge(id);
                    showSuccess("Challenge deleted.");
                  } catch (e) {
                    console.error(e);
                    showError("Failed to delete challenge.");
                  }
                }
              )
            }
            showSuccess={showSuccess}
            showError={showError}
          />
        )}

        {activeTab === "leaderboard" && <LeaderboardPanel />}

        {activeTab === "teams" && (
          <TeamManager
            teams={teams}
            loading={teamsLoading}
            openConfirm={openConfirm}
            openInput={openInput}
            onTemporaryBan={async (id, mins) => {
              try {
                await banTeam(id, mins);
                showSuccess("Team temporarily banned.");
              } catch (e) {
                console.error(e);
                showError("Failed to ban team.");
              }
            }}
            onPermanentBan={async (id) => {
              try {
                await banTeam(id, 0);
                showSuccess("Team permanently banned.");
              } catch (e) {
                console.error(e);
                showError("Failed to permanently ban team.");
              }
            }}
            onUnban={async (id) => {
              try {
                await unbanTeam(id);
                showSuccess("Team unbanned.");
              } catch (e) {
                console.error(e);
                showError("Failed to unban team.");
              }
            }}
            onPenalty={async (id, pts) => {
              try {
                await applyPenalty(id, pts);
                showSuccess("Penalty applied.");
              } catch (e) {
                console.error(e);
                showError("Failed to apply penalty.");
              }
            }}
          />
        )}
      </main>

      {/* Confirm & Input modals (reuse your existing components) */}
      <ConfirmModal
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
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
        onConfirm={async (val: string) => {
          await input.onConfirm(val);
          closeInput();
        }}
        onCancel={closeInput}
      />
    </div>
  );
}
