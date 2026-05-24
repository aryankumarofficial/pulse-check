export interface ActivityLog {
  id: string;
  tenant_id: string;
  user_id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
