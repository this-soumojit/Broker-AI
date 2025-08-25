// web-app/src/pages/app/profile/index.tsx

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Pencil, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { signUpFormSchema } from "@/pages/auth/sign-up/interface";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile, updateUserProfile } from "@/services/auth";
import PageLoader from "@/components/page-loader";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await getUserProfile();
        setUser(res.data);
        setFormData((prev) => ({
          ...prev,
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone || "",
        }));
      } catch {
        showError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      if (!user?.id) {
        showError(new Error("User ID not found"));
        return;
      }

      if (changePassword) {
        if (!formData.currentPassword.trim() || !formData.newPassword.trim()) {
          showError(new Error("Both current and new passwords are required"));
          return;
        }

        // Validate both current and new password against signup rules
        try {
          const pwSchema: any = (signUpFormSchema as any).shape.password;

          const currentPasswordTrimmed = formData.currentPassword.trim();
          const newPasswordTrimmed = formData.newPassword.trim();

          const currentCheck = pwSchema.safeParse(currentPasswordTrimmed);
          if (!currentCheck.success) {
            const errMsg =
              currentCheck.error?.errors?.[0]?.message ||
              "Invalid current password";
            showError(new Error(errMsg));
            return;
          }

          const newCheck = pwSchema.safeParse(newPasswordTrimmed);
          if (!newCheck.success) {
            const errMsg =
              newCheck.error?.errors?.[0]?.message || "Invalid new password";
            showError(new Error(errMsg));
            return;
          }
        } catch (err) {
          // fallback simple checks
          if (formData.currentPassword.trim().length < 8) {
            showError(
              new Error("Current password must be at least 8 characters")
            );
            return;
          }
          if (formData.newPassword.trim().length < 8) {
            showError(new Error("New password must be at least 8 characters"));
            return;
          }
        }
      }

      const payload: any = {
        name: formData.name,
        // Remove email and phone from payload as they cannot be changed
      };

      if (changePassword) {
        payload.currentPassword = formData.currentPassword.trim();
        payload.newPassword = formData.newPassword.trim();
      }

      const res = await updateUserProfile(user.id, payload);

      // Update local state
      setUser(res.data);

      // Update localStorage and notify all components using useAuth
      const updatedUser = { ...user, ...res.data };
      updateUser(updatedUser);

      showSuccess("Profile updated successfully");
      setEditing(false);
      setChangePassword(false);
      setShowForgotPassword(false);

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));
    } catch (error: any) {
      console.error("Update failed:", error);

      // Check if error is related to incorrect current password (handle multiple shapes)
      const serverMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "";

      const isIncorrectCurrent =
        /current password.*incorrect/i.test(serverMsg) ||
        /incorrect current password/i.test(serverMsg) ||
        /current password is incorrect/i.test(serverMsg);

      if (isIncorrectCurrent) {
        setShowForgotPassword(true);
        showError(new Error(serverMsg || "Current password is incorrect"));
      } else {
        // If backend returned password complexity error, it may be about newPassword.
        showError(error);
      }
    }
  };

  if (loading) return <PageLoader isLoading />;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader className="pb-2 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setEditing((prev) => !prev)}
              className="hover:bg-muted"
              title={editing ? "Cancel" : "Edit"}
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            <div className="flex items-center gap-4">
              <User className="text-muted-foreground w-5 h-5" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-base font-medium">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Mail className="text-muted-foreground w-5 h-5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-base font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Phone className="text-muted-foreground w-5 h-5" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-base font-medium">
                  {user?.phone?.trim() ? user.phone : "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {editing && (
          <Card className="shadow-md border border-border">
            <CardHeader>
              <CardTitle className="text-xl">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Name</p>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="bg-muted cursor-not-allowed"
                  placeholder="Email cannot be changed"
                />
                <p className="text-xs text-muted-foreground mt-1 italic">
                  *Email address cannot be changed for security reasons
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <Input
                  name="phone"
                  value={formData.phone}
                  readOnly
                  disabled
                  className="bg-muted cursor-not-allowed"
                  placeholder="Phone cannot be changed"
                />
                <p className="text-xs text-muted-foreground mt-1 italic">
                  *Phone number cannot be changed for security reasons
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="change-password"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                />
                <label
                  htmlFor="change-password"
                  className="text-sm text-muted-foreground"
                >
                  Change Password
                </label>
              </div>

              {changePassword && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Current Password
                    </p>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="********"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {showForgotPassword && (
                      <div className="mt-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-xs"
                          onClick={() => navigate("/auth/forgot-password")}
                        >
                          Forgot password?
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      New Password
                    </p>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        placeholder="********"
                        onChange={handleChange}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setChangePassword(false);
                    setShowForgotPassword(false);
                    setFormData((prev) => ({
                      ...prev,
                      name: user?.name || "",
                      email: user?.email || "",
                      phone: user?.phone || "",
                      currentPassword: "",
                      newPassword: "",
                    }));
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
