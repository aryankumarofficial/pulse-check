"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { insforge } from "@/lib/insforge";

export default function AdminSettingsPage() {
  const [savingSignups, setSavingSignups] = useState(false);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  
  const [publicSignups, setPublicSignups] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Using standard PostgREST table select via insforge SDK
      // InsForge SDK automatically infers PostgREST endpoints for tables
      const { data, error } = await insforge.database.from("platform_settings").select("*");
      if (error) throw error;

      if (data) {
        data.forEach((setting: any) => {
          if (setting.key === "maintenance_mode") setMaintenanceMode(setting.value === true);
          if (setting.key === "public_signups") setPublicSignups(setting.value === true);
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load platform settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSignups = async () => {
    setSavingSignups(true);
    try {
      const { error } = await insforge.database.rpc("update_platform_setting", {
        setting_key: "public_signups",
        setting_value: publicSignups
      });
      if (error) throw error;
      toast.success("Sign-up settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSavingSignups(false);
    }
  };

  const handleSaveMaintenance = async () => {
    setSavingMaintenance(true);
    try {
      const { error } = await insforge.database.rpc("update_platform_setting", {
        setting_key: "maintenance_mode",
        setting_value: maintenanceMode
      });
      if (error) throw error;
      toast.success("Maintenance settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update maintenance settings");
    } finally {
      setSavingMaintenance(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;
  }

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
              <Switch 
                checked={publicSignups} 
                onCheckedChange={setPublicSignups} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Users must verify their email before accessing the dashboard. (Currently managed in dashboard)
                </p>
              </div>
              <Switch disabled defaultChecked />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button onClick={handleSaveSignups} disabled={savingSignups}>
              {savingSignups ? (
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
              <Switch 
                checked={maintenanceMode} 
                onCheckedChange={setMaintenanceMode} 
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button onClick={handleSaveMaintenance} disabled={savingMaintenance} variant="outline">
              {savingMaintenance ? "Saving..." : "Save Maintenance Settings"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
