"use client";

import { useState, useCallback, useMemo } from "react";

export function useAdminModals() {
  /* ----------------------------------------
     CONFIRM MODAL STATE
  ---------------------------------------- */
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  const openConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => Promise<void>
    ) => {
      setConfirmState({
        open: true,
        title,
        message,
        onConfirm, // safe: stored synchronously & memoized call below
      });
    },
    []
  );

  const closeConfirm = useCallback(() => {
    setConfirmState((prev) => ({ ...prev, open: false }));
  }, []);

  /* ----------------------------------------
     INPUT MODAL STATE
  ---------------------------------------- */
  const [inputState, setInputState] = useState({
    open: false,
    title: "",
    message: "",
    label: "",
    onConfirm: async (_val: string) => {},
  });

  const openInput = useCallback(
    (
      title: string,
      message: string,
      label: string,
      onConfirm: (value: string) => Promise<void>
    ) => {
      setInputState({
        open: true,
        title,
        message,
        label,
        onConfirm,
      });
    },
    []
  );

  const closeInput = useCallback(() => {
    setInputState((prev) => ({ ...prev, open: false }));
  }, []);

  /* ----------------------------------------
     MEMOIZED RETURN OBJECT (prevents rerenders)
  ---------------------------------------- */
  return useMemo(
    () => ({
      confirm: confirmState,
      input: inputState,
      openConfirm,
      closeConfirm,
      openInput,
      closeInput,
    }),
    [confirmState, inputState, openConfirm, closeConfirm, openInput, closeInput]
  );
}
