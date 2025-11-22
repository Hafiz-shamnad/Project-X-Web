"use client";

import { useState } from "react";
import type { ConfirmVariant } from "../../components/ConfirmModal";

export function useAdminModals() {
  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    variant: "warning" as ConfirmVariant,
    onConfirm: async () => {},
  });

  const [input, setInput] = useState({
    open: false,
    title: "",
    message: "",
    label: "",
    onConfirm: async (_value: string) => {},
  });

  const openConfirm = (
    title: string,
    message: string,
    onConfirm: () => Promise<void>,
    variant: "danger" | "warning" | "success" = "warning"
  ) => {
    setConfirm({ open: true, title, message, onConfirm, variant });
  };

  const closeConfirm = () => {
    setConfirm((prev) => ({ ...prev, open: false }));
  };

  const openInput = (
    title: string,
    message: string,
    label: string,
    onConfirm: (value: string) => Promise<void>
  ) => {
    setInput({ open: true, title, message, label, onConfirm });
  };

  const closeInput = () => {
    setInput((prev) => ({ ...prev, open: false }));
  };

  return {
    confirm,
    input,
    openConfirm,
    openInput,
    closeConfirm,
    closeInput,
  };
}
