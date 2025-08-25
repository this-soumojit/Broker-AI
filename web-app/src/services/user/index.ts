import api from "../api";

export interface UserPlanData {
  planName: string;
  canSendReminders: boolean;
}

export const getUserPlanPermissions = async (
  userId: string,
  token: string
): Promise<{ data: UserPlanData }> => {
  const response = await api.get(
    `/api/v1/users/${userId}/reminder-permission`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  // Backend returns data directly, not wrapped in { data: ... }
  return { data: response.data };
};
