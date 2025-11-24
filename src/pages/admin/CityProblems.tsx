import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, MapPin, Calendar, User } from "lucide-react";
import StatusPill from "@/components/StatusPill";

interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  image_url: string;
  created_at: string;
  user_id: string;
  username?: string;
  is_verified?: boolean;
}

const AdminCityProblems = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [actionType, setActionType] = useState<"resolve" | "false" | null>(null);
  const [proofImage, setProofImage] = useState("");
  const [reason, setReason] = useState("");
  const [cityId, setCityId] = useState<string | null>(null);

  useEffect(() => {
    loadProblems();
  }, [searchParams]);

  const loadProblems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in");
        navigate("/login");
        return;
      }

      // Get admin's city
      const { data: cityAccess } = await supabase
        .from("admin_city_access")
        .select("city_id")
        .eq("admin_id", user.id)
        .single();

      if (!cityAccess) {
        toast.error("No city assigned");
        return;
      }

      setCityId(cityAccess.city_id);

      // Build query
      let query = supabase
        .from("problems")
        .select("*")
        .eq("city_id", cityAccess.city_id)
        .order("created_at", { ascending: false });

      const statusFilter = searchParams.get("status");
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch user profiles for each problem
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, is_verified")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const problemsWithProfiles = data.map(problem => ({
          ...problem,
          username: profileMap.get(problem.user_id)?.username,
          is_verified: profileMap.get(problem.user_id)?.is_verified
        }));
        
        setProblems(problemsWithProfiles);
      } else {
        setProblems([]);
      }
    } catch (error) {
      console.error("Error loading problems:", error);
      toast.error("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedProblem || !cityId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update problem status
      const { error: updateError } = await supabase
        .from("problems")
        .update({
          status: "resolved",
          resolved_by: user.id,
          resolved_at: new Date().toISOString()
        })
        .eq("id", selectedProblem.id);

      if (updateError) throw updateError;

      // Award points to reporter
      const { data: profile } = await supabase
        .from("profiles")
        .select("civic_points")
        .eq("id", selectedProblem.user_id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ civic_points: (profile.civic_points || 0) + 100 })
          .eq("id", selectedProblem.user_id);
      }

      toast.success("Problem marked as resolved! Reporter earned 100 points.");
      setSelectedProblem(null);
      setActionType(null);
      loadProblems();
    } catch (error) {
      console.error("Error resolving problem:", error);
      toast.error("Failed to resolve problem");
    }
  };

  const handleMarkFalse = async () => {
    if (!selectedProblem || !reason) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update problem status
      const { error: updateError } = await supabase
        .from("problems")
        .update({
          status: "false",
          false_proof_image: proofImage || null,
          false_reason: reason
        })
        .eq("id", selectedProblem.id);

      if (updateError) throw updateError;

      // Get current false reports count
      const { data: profile } = await supabase
        .from("profiles")
        .select("false_reports_count, civic_points")
        .eq("id", selectedProblem.user_id)
        .single();

      if (profile) {
        const newCount = (profile.false_reports_count || 0) + 1;
        let updates: any = { false_reports_count: newCount };

        if (newCount === 1) {
          toast.warning("User received a warning for false report");
        } else if (newCount === 2) {
          updates.civic_points = Math.max(0, (profile.civic_points || 0) - 100);
          toast.warning("User lost 100 civic points for repeated false reports");
        } else if (newCount >= 3) {
          const suspensionDate = new Date();
          suspensionDate.setDate(suspensionDate.getDate() + 7);
          updates.suspension_until = suspensionDate.toISOString();
          toast.error("User suspended for 7 days due to repeated false reports");
        }

        await supabase
          .from("profiles")
          .update(updates)
          .eq("id", selectedProblem.user_id);
      }

      toast.success("Problem marked as false report");
      setSelectedProblem(null);
      setActionType(null);
      setProofImage("");
      setReason("");
      loadProblems();
    } catch (error) {
      console.error("Error marking false:", error);
      toast.error("Failed to mark as false");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">City Problems</h1>
            <Button variant="outline" onClick={() => navigate("/admin")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex gap-2 flex-wrap">
          <Button
            variant={!searchParams.get("status") ? "default" : "outline"}
            onClick={() => navigate("/admin/problems")}
          >
            All
          </Button>
          <Button
            variant={searchParams.get("status") === "pending" ? "default" : "outline"}
            onClick={() => navigate("/admin/problems?status=pending")}
          >
            Pending
          </Button>
          <Button
            variant={searchParams.get("status") === "resolved" ? "default" : "outline"}
            onClick={() => navigate("/admin/problems?status=resolved")}
          >
            Resolved
          </Button>
          <Button
            variant={searchParams.get("status") === "false" ? "default" : "outline"}
            onClick={() => navigate("/admin/problems?status=false")}
          >
            False Reports
          </Button>
        </div>

        {problems.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No problems found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {problems.map((problem) => (
              <Card key={problem.id} className="p-4">
                <div className="flex gap-4">
                  {problem.image_url && (
                    <img
                      src={problem.image_url}
                      alt={problem.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{problem.title}</h3>
                      <StatusPill status={problem.status as any} />
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {problem.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                      <Badge variant="secondary">{problem.category}</Badge>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {problem.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(problem.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        User ID: {problem.user_id.slice(0, 8)}...
                        {problem.is_verified && (
                          <Badge variant="default" className="ml-1">Verified</Badge>
                        )}
                      </span>
                    </div>

                    {problem.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedProblem(problem);
                            setActionType("resolve");
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Resolved
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedProblem(problem);
                            setActionType("false");
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Mark False
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resolve Dialog */}
      <Dialog open={actionType === "resolve"} onOpenChange={() => {
        setActionType(null);
        setSelectedProblem(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Resolved</DialogTitle>
            <DialogDescription>
              This will mark the problem as resolved and award 100 civic points to the reporter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">Are you sure you want to mark this problem as resolved?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setActionType(null);
                setSelectedProblem(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleResolve}>
                Confirm Resolution
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* False Report Dialog */}
      <Dialog open={actionType === "false"} onOpenChange={() => {
        setActionType(null);
        setSelectedProblem(null);
        setProofImage("");
        setReason("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as False Report</DialogTitle>
            <DialogDescription>
              This will penalize the user for submitting a false report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Proof Image URL (Optional)
              </label>
              <Input
                placeholder="https://example.com/proof.jpg"
                value={proofImage}
                onChange={(e) => setProofImage(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Reason *
              </label>
              <Textarea
                placeholder="Explain why this is a false report..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setActionType(null);
                setSelectedProblem(null);
                setProofImage("");
                setReason("");
              }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleMarkFalse}>
                Mark as False
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCityProblems;