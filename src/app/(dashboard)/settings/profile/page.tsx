"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, Camera, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth/client";
import type { User } from "@/lib/auth/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const ProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  maritalStatus: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  bio: z.string().optional(),
  occupation: z.string().optional(),
});

type ProfileInput = z.infer<typeof ProfileSchema>;

export default function SettingsProfilePage() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      maritalStatus: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      bio: "",
      occupation: "",
    },
  });

  // Fetch user profile from API to get extended fields
  const { data: profileData } = useQuery({
    queryKey: ["user_profile"],
    queryFn: async () => {
      const res = await fetch("/api/v1/users/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      const json = await res.json();
      return json.data;
    },
  });

  // Extract first/last name from full name
  useEffect(() => {
    if (user?.name || profileData) {
      const nameStr = user?.name || profileData?.name || "";
      const parts = nameStr.trim().split(/\s+/);
      const dobStr = profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : "";
      
      form.reset({
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        email: user?.email || profileData?.email || "",
        phone: profileData?.phone || "",
        dateOfBirth: dobStr,
        gender: profileData?.gender || "",
        bloodGroup: profileData?.bloodGroup || "",
        maritalStatus: profileData?.maritalStatus || "",
        emergencyContactName: profileData?.emergencyContactName || "",
        emergencyContactPhone: profileData?.emergencyContactPhone || "",
        bio: profileData?.bio || "",
        occupation: profileData?.occupation || "",
      });
    }
  }, [user, profileData, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileInput & { image?: string }) => {
      const res = await fetch("/api/v1/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          image: data.image,
          dateOfBirth: data.dateOfBirth || null,
          gender: data.gender || null,
          bloodGroup: data.bloodGroup || null,
          maritalStatus: data.maritalStatus || null,
          emergencyContactName: data.emergencyContactName || null,
          emergencyContactPhone: data.emergencyContactPhone || null,
          bio: data.bio || null,
          occupation: data.occupation || null,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["user_profile"] });
      // Force reload the page to refresh Better Auth session state and sidebar avatar
      window.location.reload();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      const res = await fetch("/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to upload avatar");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setAvatarPreview(data.data?.url ?? null);
      toast.success("Avatar updated");
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    uploadAvatarMutation.mutate(file, {
      onSettled: () => setIsUploading(false),
    });
  };

  const handleRemoveAvatar = async () => {
    try {
      const res = await fetch("/api/v1/users/avatar", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove avatar");
      setAvatarPreview(null);
      toast.success("Avatar removed");
      queryClient.invalidateQueries({ queryKey: ["session"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove avatar");
    }
  };

  const onSubmit = (data: ProfileInput) => {
    updateProfileMutation.mutate({
      ...data,
      image: displayAvatar || undefined,
    });
  };

  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U";
  const displayAvatar = avatarPreview ?? user?.image ?? null;

  const handleAvatarClick = () => {
    const input = document.getElementById('avatar-upload');
    input?.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information and avatar.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserRound className="w-5 h-5 text-primary" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Your avatar is visible to colleagues and patients. Recommended: 512x512px, max 5MB.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 bg-muted cursor-pointer" onClick={handleAvatarClick}>
                    <AvatarImage src={displayAvatar || undefined} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  {displayAvatar && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveAvatar(); }}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-white hover:bg-destructive/90 transition-colors"
                      aria-label="Remove avatar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="w-full flex flex-col items-center gap-2">
                  <label className="cursor-pointer">
                    <Button variant="outline" className="gap-2 w-full justify-center" disabled={isUploading}>
                      <Camera className="w-4 h-4" />
                      {isUploading ? "Uploading..." : "Change Avatar"}
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className="hidden"
                      id="avatar-upload"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground text-center">
                    JPG, PNG, or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b pb-4 mb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserRound className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                This information is used across the system for identification and communication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      disabled={updateProfileMutation.isPending}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      disabled={updateProfileMutation.isPending}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    disabled={updateProfileMutation.isPending}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. +1 (555) 123-4567"
                    {...form.register("phone")}
                    disabled={updateProfileMutation.isPending}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...form.register("dateOfBirth")}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      {...form.register("gender")}
                      disabled={updateProfileMutation.isPending}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <select
                      id="bloodGroup"
                      {...form.register("bloodGroup")}
                      disabled={updateProfileMutation.isPending}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">Marital Status</Label>
                    <select
                      id="maritalStatus"
                      {...form.register("maritalStatus")}
                      disabled={updateProfileMutation.isPending}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Status</option>
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                      <option value="DIVORCED">Divorced</option>
                      <option value="WIDOWED">Widowed</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      placeholder="e.g. John Doe"
                      {...form.register("emergencyContactName")}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      type="tel"
                      placeholder="e.g. +1 (555) 000-0000"
                      {...form.register("emergencyContactPhone")}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                </div>

                {(user as any)?.role === "PATIENT" ? (
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      placeholder="e.g. Software Engineer"
                      {...form.register("occupation")}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      placeholder="e.g. Brief professional bio..."
                      {...form.register("bio")}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>
                )}

                <Separator className="my-4" />

                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Role:</strong> {(user as Record<string, unknown>)?.role?.toString().replace(/_/g, " ") ?? "—"}</p>
                  <p><strong>Account Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : "—"}</p>
                  <p><strong>Last Updated:</strong> {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-GB') : "—"}</p>
                </div>

                <Button type="submit" className="w-full md:w-auto mt-4" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Icon imports
import { UserRound } from "lucide-react";