"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";

interface Tenant {
  _id: string;
  tenantId: string;
  name: string;
  domain: string;
  logoUrl: string;
  themeColor: string;
  welcomeMessage: string;
  aiPersona: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

interface TenantFormData {
  tenantId: string;
  name: string;
  domain: string;
  logoUrl: string;
  themeColor: string;
  welcomeMessage: string;
  aiPersona: string;
  model: string;
}

const INITIAL_FORM_DATA: TenantFormData = {
  tenantId: "",
  name: "",
  domain: "",
  logoUrl: "",
  themeColor: "#3b82f6",
  welcomeMessage: "Hello! How can I help you today?",
  aiPersona: "You are a helpful AI assistant.",
  model: "gemini-2.0-flash-exp",
};

export default function AdminPage() {
  const { data: session } = useSession();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState<TenantFormData>(INITIAL_FORM_DATA);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tenants");
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tenant?: Tenant) => {
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        tenantId: tenant.tenantId,
        name: tenant.name,
        domain: tenant.domain,
        logoUrl: tenant.logoUrl,
        themeColor: tenant.themeColor,
        welcomeMessage: tenant.welcomeMessage,
        aiPersona: tenant.aiPersona,
        model: tenant.model,
      });
      setImagePreview(tenant.logoUrl);
    } else {
      setEditingTenant(null);
      setFormData(INITIAL_FORM_DATA);
      setImagePreview("");
    }
    setError("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTenant(null);
    setFormData(INITIAL_FORM_DATA);
    setImagePreview("");
    setError("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        logoUrl: base64String,
      }));
      setImagePreview(base64String);
      setError("");
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const generateTenantId = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Auto-generate tenantId from name if creating new tenant
      const dataToSend = editingTenant
        ? formData
        : {
            ...formData,
            tenantId: generateTenantId(formData.name),
          };

      console.log('=== FRONTEND: Submitting tenant ===');
      console.log('Form data:', JSON.stringify(formData, null, 2));
      console.log('Data to send:', JSON.stringify(dataToSend, null, 2));
      console.log('Domain field:', dataToSend.domain);
      console.log('Has domain?', 'domain' in dataToSend);

      const url = editingTenant
        ? `/api/tenants/${editingTenant.tenantId}`
        : "/api/tenants";

      const method = editingTenant ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save tenant");
        return;
      }

      console.log('=== FRONTEND: Tenant saved successfully ===');
      console.log('Response data:', JSON.stringify(data, null, 2));
      console.log('Response domain:', data.domain);

      // Refresh tenant list
      await fetchTenants();
      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting tenant:', error);
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTenant) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/tenants/${deletingTenant.tenantId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTenants();
        setDeleteDialogOpen(false);
        setDeletingTenant(null);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete tenant");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {session?.user?.name}
            </p>
          </div>
          <Button onClick={() => signOut({ callbackUrl: "/auth/signin" })} variant="outline">
            Sign Out
          </Button>
        </div>

        {/* Tenants Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Tenant Management
                </CardTitle>
                <CardDescription>
                  Manage all registered tenants and their configurations
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Tenant
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tenants found. Create your first tenant to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Tenant ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Theme</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant) => (
                    <TableRow key={tenant._id}>
                      <TableCell>
                        {tenant.logoUrl ? (
                          <div className="w-10 h-10 border rounded overflow-hidden bg-muted">
                            <img
                              src={tenant.logoUrl}
                              alt={`${tenant.name} logo`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 border rounded bg-muted flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {tenant.tenantId}
                      </TableCell>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {tenant.domain}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded border"
                            style={{ backgroundColor: tenant.themeColor }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {tenant.themeColor}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tenant.model}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(tenant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeletingTenant(tenant);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTenant ? "Edit Tenant" : "Add New Tenant"}
              </DialogTitle>
              <DialogDescription>
                {editingTenant
                  ? "Update the tenant configuration below"
                  : "Enter the details for the new tenant"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {editingTenant && (
                <div className="space-y-2">
                  <Label htmlFor="tenantId">Tenant ID</Label>
                  <Input
                    id="tenantId"
                    name="tenantId"
                    value={formData.tenantId}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tenant ID cannot be changed
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Acme Corporation"
                  required
                  disabled={submitting}
                />
                {!editingTenant && formData.name && (
                  <p className="text-xs text-muted-foreground">
                    Tenant ID will be: <span className="font-mono">{generateTenantId(formData.name)}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">
                  Domain <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  placeholder="example.com"
                  required
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Used for whitelabeling and tenant verification
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Upload an image (max 2MB, JPG/PNG/GIF)
                </p>
                {imagePreview && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="relative w-20 h-20 border rounded overflow-hidden bg-muted">
                      <img
                        src={imagePreview}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImagePreview("");
                        setFormData((prev) => ({ ...prev, logoUrl: "" }));
                      }}
                      disabled={submitting}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="themeColor">Theme Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="themeColor"
                      name="themeColor"
                      type="color"
                      value={formData.themeColor}
                      onChange={handleChange}
                      className="w-20"
                      disabled={submitting}
                    />
                    <Input
                      value={formData.themeColor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          themeColor: e.target.value,
                        }))
                      }
                      placeholder="#3b82f6"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="gemini-2.0-flash-exp"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  name="welcomeMessage"
                  value={formData.welcomeMessage}
                  onChange={handleChange}
                  placeholder="Hello! How can I help you today?"
                  rows={2}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aiPersona">AI Persona</Label>
                <Textarea
                  id="aiPersona"
                  name="aiPersona"
                  value={formData.aiPersona}
                  onChange={handleChange}
                  placeholder="You are a helpful AI assistant."
                  rows={3}
                  disabled={submitting}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editingTenant ? "Update" : "Create"} Tenant</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Tenant</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deletingTenant?.name}</span>?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingTenant(null);
                  setError("");
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>Delete</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
