import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface UserPreferences {
  id: string;
  userId: string;
  minimumCashBuffer: string | null;
  bufferPercentage: string;
  paydayDaysOfMonth: number[];
  enableDailyDigest: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useUserPreferences() {
  return useQuery({
    queryKey: ["user-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/users/preferences");
      if (!res.ok) throw new Error("Failed to fetch user preferences");
      return res.json() as Promise<UserPreferences>;
    },
  });
}

export function useUpdateUserPreferences() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      minimumCashBuffer?: number | null;
      bufferPercentage?: number;
      paydayDaysOfMonth?: number[];
      enableDailyDigest?: boolean;
    }) => {
      const res = await fetch("/api/users/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update preferences");
      }
      return res.json() as Promise<UserPreferences>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-preferences"] });
      qc.invalidateQueries({ queryKey: ["safe-to-spend"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["cash-flow-plan"] });
    },
  });
}
