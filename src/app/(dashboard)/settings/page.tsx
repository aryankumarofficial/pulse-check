"use client";

import { useState } from "react";
import { User, Building2, CreditCard, Shield, Save, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { insforge } from "@/lib/insforge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { currentTenant, plan } = useTenantStore();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [name, setName] = useState(user?.profile?.name || "");

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await insforge.database
        .from("tenant_members")
        .update({ display_name: name })
        .eq("user_id", user.id);

      if (error) throw error;
      setSaveMessage("Profile updated successfully.");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setSaveMessage(err.message || "Failed to update profile.");
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and workspace preferences
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal account details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workspace */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>Current workspace details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Workspace Name</p>
              <p className="font-medium">{currentTenant?.name || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Workspace ID</p>
              <p className="font-mono text-xs">{currentTenant?.id || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Your Role</p>
              <Badge variant="outline" className="capitalize">{user?.profile?.role || "member"}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>Your current plan and usage limits</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold capitalize">{plan?.name || "Free"}</p>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Current Plan</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {plan?.max_monitors || 5} monitors · {plan?.check_interval_seconds ? `${plan.check_interval_seconds / 60}min` : "1min"} check interval · {plan?.data_retention_days || 30} days retention
              </p>
            </div>
            <Button variant="outline" disabled>
              Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>Account security settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">Last changed: Unknown</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Change Password
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Badge variant="outline" className="text-muted-foreground">Not available</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
