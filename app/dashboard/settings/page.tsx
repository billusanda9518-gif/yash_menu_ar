"use client";

import { useAuth } from "@/hooks/use-auth";
import { DashboardHeader } from "@/components/dashboard/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function SettingsPage() {
  const { profile, user } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);
      if (error) throw error;
      showToast.success("Profile updated");
    } catch {
      showToast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DashboardHeader
        title="Settings"
        description="Manage your account"
        onMenuToggle={() => {}}
      />
      <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email"
            value={user?.email || ""}
            disabled
            helperText="Email cannot be changed"
          />
          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>
      </div>
    </>
  );
}
