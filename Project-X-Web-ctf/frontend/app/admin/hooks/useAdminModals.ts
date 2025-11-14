"use client";

import { useState } from "react";

export function useAdminModals() {
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  const [input, setInput] = useState<{
    open: boolean;
    title: string;
    message: string;
    label: string;
    onConfirm: (value: string) => Promise<void>;
  }>({
    open: false,
    title: "",
    message: "",
    label: "",
    onConfirm: async () => {},
  });

  const openConfirm = (
    title: string,
    message: string,
    onConfirm: () => Promise<void>
  ) => setConfirm({ open: true, title, message, onConfirm });

  const closeConfirm = () =>
    setConfirm((prev) => ({
      ...prev,
      open: false,
    }));

  const openInput = (
    title: string,
    message: string,
    label: string,
    onConfirm: (value: string) => Promise<void>
  ) => setInput({ open: true, title, message, label, onConfirm });

  const closeInput = () =>
    setInput((prev) => ({
      ...prev,
      open: false,
    }));

  return { confirm, input, openConfirm, openInput, closeConfirm, closeInput };
}
