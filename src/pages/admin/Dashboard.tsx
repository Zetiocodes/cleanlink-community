import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface DashboardStats {
  totalProblems: number;
  pending: number;
  resolved: number;
  false: number;
  cityName: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to access admin panel");
        navigate("/login");
        return;
      }

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roles) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      // Get admin's city
      const { data: cityAccess } = await supabase
        .from("admin_city_access")
        .select("city_id, cities(name)")
        .eq("admin_id", user.id)
        .single();

      if (!cityAccess) {
        toast.error("No city assigned to your admin account");
        return;
      }

      // Get stats for admin's city
      const { data: problems } = await supabase
        .from("problems")
        .select("status")
        .eq("city_id", cityAccess.city_id);

      const pending = problems?.filter(p => p.status === "pending").length || 0;
      const resolved = problems?.filter(p => p.status === "resolved").length || 0;
      const falseReports = problems?.filter(p => p.status === "false").length || 0;

      setStats({
        totalProblems: problems?.length || 0,
        pending,
        resolved,
        false: falseReports,
        cityName: (cityAccess.cities as any).name
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {stats && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-5 h-5" />
                <span className="text-lg">Managing: <span className="font-semibold text-foreground">{stats.cityName}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Problems</p>
                    <p className="text-3xl font-bold">{stats.totalProblems}</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-muted-foreground" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending</p>
                    <p className="text-3xl font-bold text-[hsl(var(--status-pending))]">{stats.pending}</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-[hsl(var(--status-pending))]" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Resolved</p>
                    <p className="text-3xl font-bold text-[hsl(var(--status-resolved))]">{stats.resolved}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-[hsl(var(--status-resolved))]" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">False Reports</p>
                    <p className="text-3xl font-bold text-[hsl(var(--status-rejected))]">{stats.false}</p>
                  </div>
                  <XCircle className="w-10 h-10 text-[hsl(var(--status-rejected))]" />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate("/admin/problems")}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    View All Problems
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate("/admin/problems?status=pending")}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    View Pending Problems
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">System Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium">Admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City:</span>
                    <span className="font-medium">{stats.cityName}</span>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;