"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Platform settings updated successfully");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure global platform variables and features.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Sign-up Configuration</CardTitle>
            <CardDescription>
              Control how new users can join the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Public Sign-ups</Label>
                <p className="text-sm text-muted-foreground">
                  When disabled, new users can only be invited by admins.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Users must verify their email before accessing the dashboard.
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label>Default Free Plan Limits</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Max Monitors</Label>
                  <Input type="number" defaultValue="5" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Check Interval (seconds)</Label>
                  <Input type="number" defaultValue="60" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Sign-up Settings</>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode</CardTitle>
            <CardDescription>
              Temporarily restrict access to the platform for maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 bg-destructive/5">
              <div className="space-y-0.5">
                <Label className="text-destructive font-semibold">Enable Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  All non-admin users will see a maintenance page. Active monitors will continue running.
                </p>
              </div>
              <Switch />
            </div>
            
            <div className="space-y-2">
              <Label>Maintenance Message</Label>
              <Input defaultValue="We are currently undergoing scheduled maintenance. Please check back soon." />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button onClick={handleSave} disabled={saving} variant="outline">
              Save Maintenance Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
