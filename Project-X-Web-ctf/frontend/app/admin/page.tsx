"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

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

/* ------------------------------------------
     MAIN COMPONENT
------------------------------------------- */
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<
    "create" | "manage" | "leaderboard" | "teams"
  >("create");

  /* ---------- Toasts ---------- */
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showSuccess = useCallback((msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }, []);

  const showError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  }, []);

  /* ---------- Hooks (Ch & Teams) ---------- */
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

  /* ---------- Admin Modals ---------- */
  const { confirm, input, openConfirm, openInput, closeConfirm, closeInput } =
    useAdminModals();

  /* ---------- Initial Fetch ---------- */
  useEffect(() => {
    fetchChallenges().catch(() => showError("Failed to fetch challenges"));
    fetchTeams().catch(() => showError("Failed to fetch teams"));
  }, [fetchChallenges, fetchTeams, showError]);

  /* ---------- BULK ACTIONS (NOW FIXED) ---------- */
  const bulkRelease = useCallback(
    async (ids: number[]) => {
      for (const id of ids) {
        await toggleRelease(id, true);
      }
    },
    [toggleRelease]
  );

  const bulkHide = useCallback(
    async (ids: number[]) => {
      for (const id of ids) {
        await toggleRelease(id, false);
      }
    },
    [toggleRelease]
  );

  const bulkDelete = useCallback(
    async (ids: number[]) => {
      for (const id of ids) {
        await deleteChallenge(id);
      }
    },
    [deleteChallenge]
  );

  /* ---------- Memoized Pages ---------- */

  const CreatePage = useMemo(
    () => (
      <ChallengeCreate
        onCreate={async (fd) => {
          try {
            await createChallenge(fd);
            showSuccess("Challenge created.");
          } catch {
            showError("Creation failed.");
          }
        }}
      />
    ),
    [createChallenge, showSuccess, showError]
  );

  const ManagePage = useMemo(
    () => (
      <ChallengeManage
        challenges={challenges}
        loading={challengesLoading}
        onToggleRelease={async (id, currentState) => {
          try {
            await toggleRelease(id, !currentState);
            showSuccess(
              currentState ? "Challenge hidden." : "Challenge released."
            );
          } catch {
            showError("Failed to update release.");
          }
        }}
        onDelete={(id, name) =>
          openConfirm(
            "Delete Challenge",
            `Delete "${name}" permanently?`,
            async () => {
              try {
                await deleteChallenge(id);
                showSuccess("Challenge deleted.");
              } catch {
                showError("Failed to delete.");
              }
            }
          )
        }
        onBulkRelease={async (ids) => {
          try {
            await bulkRelease(ids);
            showSuccess("Challenges released.");
          } catch {
            showError("Bulk release failed.");
          }
        }}
        onBulkHide={async (ids) => {
          try {
            await bulkHide(ids);
            showSuccess("Challenges hidden.");
          } catch {
            showError("Bulk hide failed.");
          }
        }}
        onBulkDelete={async (ids) => {
          await new Promise<void>((resolve) => {
            openConfirm(
              "Delete Multiple Challenges",
              `Delete ${ids.length} challenges permanently?`,
              async () => {
                await bulkDelete(ids);
                resolve();
              }
            );
          });
        }}
        showSuccess={showSuccess}
        showError={showError}
      />
    ),
    [
      challenges,
      challengesLoading,
      toggleRelease,
      deleteChallenge,
      openConfirm,
      bulkRelease,
      bulkHide,
      bulkDelete,
      showSuccess,
      showError,
    ]
  );

  const LeaderboardPage = useMemo(() => <LeaderboardPanel />, []);

  const TeamsPage = useMemo(
    () => (
      <TeamManager
        teams={teams}
        loading={teamsLoading}
        openConfirm={openConfirm}
        openInput={openInput}
        onTemporaryBan={async (id, mins) => {
          try {
            await banTeam(id, mins);
            showSuccess("Temporary ban applied.");
          } catch {
            showError("Failed to apply temporary ban.");
          }
        }}
        onPermanentBan={async (id) => {
          try {
            await banTeam(id, 0);
            showSuccess("Permanent ban applied.");
          } catch {
            showError("Permanent ban failed.");
          }
        }}
        onUnban={async (id) => {
          try {
            await unbanTeam(id);
            showSuccess("Team unbanned.");
          } catch {
            showError("Unban failed.");
          }
        }}
        onPenalty={async (id, pts) => {
          try {
            await applyPenalty(id, pts);
            showSuccess("Penalty applied.");
          } catch {
            showError("Penalty failed.");
          }
        }}
      />
    ),
    [
      teams,
      teamsLoading,
      openConfirm,
      openInput,
      banTeam,
      unbanTeam,
      applyPenalty,
      showSuccess,
      showError,
    ]
  );

  /* ---------- RENDER ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-gray-100">
      {/* Toast */}
      {(successMsg || errorMsg) && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg border backdrop-blur-md shadow-lg
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
        {activeTab === "leaderboard" && LeaderboardPage}
        {activeTab === "teams" && TeamsPage}
      </main>

      {/* Modals */}
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
        onConfirm={async (v) => {
          await input.onConfirm(v);
          closeInput();
        }}
        onCancel={closeInput}
      />
    </div>
  );
}
