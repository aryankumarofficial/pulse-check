"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { insforge } from "@/lib/insforge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShieldMinus, Shield } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuthStore();

  const fetchAdmins = async () => {
    try {
      const { data, error } = await insforge.database.rpc("get_admin_users_list");
      if (error) throw error;
      if (data) {
        const allUsers = typeof data === "string" ? JSON.parse(data) : data;
        setAdmins(allUsers.filter((u: any) => u.role === "admin"));
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleRevokeAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to revoke admin privileges?")) return;
    try {
      await insforge.database.rpc("set_user_role", { target_user_id: userId, new_role: "user" });
      fetchAdmins();
    } catch (error) {
      console.error("Error revoking admin:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage users with elevated privileges on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Administrators</CardTitle>
          <CardDescription>
            Users with full access to all platform settings, user data, and system resources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined Date</th>
                  <th className="px-4 py-3 font-medium">Last Sign In</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-3 text-right"><Skeleton className="h-8 w-24 ml-auto rounded-md" /></td>
                    </tr>
                  ))
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No administrators found.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        {admin.email}
                        {currentUser?.id === admin.id && (
                          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">You</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default" className="bg-red-500 hover:bg-red-600">
                          {admin.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(admin.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {admin.last_sign_in_at ? format(new Date(admin.last_sign_in_at), "MMM d, yyyy") : "Never"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          disabled={currentUser?.id === admin.id}
                          onClick={() => handleRevokeAdmin(admin.id)}
                        >
                          <ShieldMinus className="h-4 w-4 mr-2" />
                          Revoke Access
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
