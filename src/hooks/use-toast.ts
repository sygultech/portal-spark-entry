
// This file replaces the original one that had circular dependencies

import { useToast as useToastOriginal } from "@/components/ui/use-toast";

// Re-export everything from the original hook
export const { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction } = useToastOriginal;

export const useToast = useToastOriginal;

// Create a toast function that can be used outside of components
export const toast = useToastOriginal().toast;
