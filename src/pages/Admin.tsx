import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { 
  Upload, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Trash2, 
  Eye,
  Download,
  Loader2,
  FileCode,
  Gamepad2,
  Folder,
  X,
  Check,
  Link as LinkIcon,
  Pencil,
  HardDrive
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Template {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string | null;
  file_size: number | null;
  thumbnail_url: string | null;
  download_count: number | null;
  created_at: string;
  external_link: string | null;
  link_title: string | null;
}

interface PageView {
  id: string;
  page_path: string;
  user_id: string | null;
  created_at: string;
}

interface TemplateClick {
  id: string;
  template_id: string;
  created_at: string;
  templates?: { title: string } | null;
}

interface ChatReport {
  id: string;
  user_email: string | null;
  message: string;
  report_type: string | null;
  status: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

const Admin: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  
  // Upload state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('software');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // Edit state
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('software');
  const [editExternalLink, setEditExternalLink] = useState('');
  const [editLinkTitle, setEditLinkTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  // Data state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [templateClicks, setTemplateClicks] = useState<TemplateClick[]>([]);
  const [chatReports, setChatReports] = useState<ChatReport[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    setLoadingData(true);
    
    const [templatesRes, pageViewsRes, clicksRes, reportsRes, profilesRes] = await Promise.all([
      supabase.from('templates').select('*').order('created_at', { ascending: false }),
      supabase.from('page_views').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('template_clicks').select('*, templates(title)').order('created_at', { ascending: false }).limit(100),
      supabase.from('chat_reports').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false })
    ]);

    if (templatesRes.data) setTemplates(templatesRes.data);
    if (pageViewsRes.data) setPageViews(pageViewsRes.data);
    if (clicksRes.data) setTemplateClicks(clicksRes.data);
    if (reportsRes.data) setChatReports(reportsRes.data);
    if (profilesRes.data) setProfiles(profilesRes.data);
    
    setLoadingData(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      toast.error('Please provide a title and file');
      return;
    }

    setUploading(true);

    try {
      // Upload main file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('templates')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: fileUrlData } = supabase.storage
        .from('templates')
        .getPublicUrl(filePath);

      let thumbnailUrl = null;

      // Upload thumbnail if provided
      if (thumbnail) {
        const thumbExt = thumbnail.name.split('.').pop();
        const thumbName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${thumbExt}`;
        const thumbPath = `thumbnails/${thumbName}`;

        const { error: thumbError } = await supabase.storage
          .from('templates')
          .upload(thumbPath, thumbnail);

        if (!thumbError) {
          const { data: thumbUrlData } = supabase.storage
            .from('templates')
            .getPublicUrl(thumbPath);
          thumbnailUrl = thumbUrlData.publicUrl;
        }
      }

      // Create template record
      const { error: insertError } = await supabase.from('templates').insert({
        title,
        description,
        category,
        file_url: fileUrlData.publicUrl,
        file_size: file.size,
        thumbnail_url: thumbnailUrl,
        external_link: externalLink || null,
        link_title: linkTitle || null,
        created_by: user?.id
      });

      if (insertError) throw insertError;

      toast.success('Template uploaded successfully!');
      setTitle('');
      setDescription('');
      setCategory('software');
      setFile(null);
      setThumbnail(null);
      setExternalLink('');
      setLinkTitle('');
      fetchAllData();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload template');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete template');
    } else {
      toast.success('Template deleted');
      fetchAllData();
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setEditTitle(template.title);
    setEditDescription(template.description || '');
    setEditCategory(template.category);
    setEditExternalLink(template.external_link || '');
    setEditLinkTitle(template.link_title || '');
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;

    const { error } = await supabase
      .from('templates')
      .update({
        title: editTitle,
        description: editDescription,
        category: editCategory,
        external_link: editExternalLink || null,
        link_title: editLinkTitle || null,
      })
      .eq('id', editingTemplate.id);

    if (error) {
      toast.error('Failed to update template');
    } else {
      toast.success('Template updated successfully!');
      setIsEditing(false);
      setEditingTemplate(null);
      fetchAllData();
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTemplate(null);
  };

  const handleUpdateReportStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('chat_reports')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      fetchAllData();
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const totalViews = pageViews.length;
  const totalDownloads = templates.reduce((acc, t) => acc + (t.download_count || 0), 0);
  const totalUsers = profiles.length;
  const pendingReports = chatReports.filter(r => r.status === 'pending').length;
  
  // Storage calculation (1GB limit for free tier)
  const MAX_STORAGE_GB = 1;
  const MAX_STORAGE_BYTES = MAX_STORAGE_GB * 1024 * 1024 * 1024;
  const usedStorageBytes = templates.reduce((acc, t) => acc + (t.file_size || 0), 0);
  const usedStorageMB = usedStorageBytes / (1024 * 1024);
  const usedStorageGB = usedStorageBytes / (1024 * 1024 * 1024);
  const storagePercentage = Math.min((usedStorageBytes / MAX_STORAGE_BYTES) * 100, 100);
  
  const formatStorage = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">
            Admin <span className="text-gradient">Dashboard</span>
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Page Views', value: totalViews, icon: Eye, color: 'text-primary' },
              { label: 'Downloads', value: totalDownloads, icon: Download, color: 'text-nova-green' },
              { label: 'Users', value: totalUsers, icon: Users, color: 'text-nova-purple' },
              { label: 'Pending Reports', value: pendingReports, icon: MessageSquare, color: 'text-nova-orange' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl border border-border/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
            
            {/* Storage Card */}
            <div className="bg-card rounded-xl border border-border/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <HardDrive className={`h-5 w-5 ${storagePercentage > 80 ? 'text-destructive' : storagePercentage > 50 ? 'text-nova-orange' : 'text-nova-blue'}`} />
              </div>
              <p className="font-display text-lg font-bold text-foreground">
                {formatStorage(usedStorageBytes)}
              </p>
              <p className="text-xs text-muted-foreground mb-2">of {MAX_STORAGE_GB} GB</p>
              <Progress 
                value={storagePercentage} 
                className={`h-2 ${storagePercentage > 80 ? '[&>div]:bg-destructive' : storagePercentage > 50 ? '[&>div]:bg-nova-orange' : '[&>div]:bg-nova-blue'}`}
              />
              <p className="text-xs text-muted-foreground mt-1">{storagePercentage.toFixed(1)}% used</p>
            </div>
          </div>

          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="upload" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Folder className="h-4 w-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="animate-fade-in">
              <div className="bg-card rounded-xl border border-border/50 p-6">
                <h2 className="font-display text-xl font-semibold mb-6">Upload New Template</h2>
                
                <form onSubmit={handleUpload} className="space-y-6 max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter template title"
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter description"
                      className="bg-muted"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-muted">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="software">
                          <div className="flex items-center gap-2">
                            <FileCode className="h-4 w-4" />
                            Software
                          </div>
                        </SelectItem>
                        <SelectItem value="games">
                          <div className="flex items-center gap-2">
                            <Gamepad2 className="h-4 w-4" />
                            Games
                          </div>
                        </SelectItem>
                        <SelectItem value="files">
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            Files
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">File *</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="bg-muted"
                    />
                    {file && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Thumbnail (optional)</Label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="externalLink" className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      External Link (optional)
                    </Label>
                    <Input
                      id="externalLink"
                      value={externalLink}
                      onChange={(e) => setExternalLink(e.target.value)}
                      placeholder="https://example.com"
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkTitle">Link Title (optional)</Label>
                    <Input
                      id="linkTitle"
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      placeholder="Visit Website"
                      className="bg-muted"
                    />
                  </div>

                  <Button type="submit" variant="glow" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Template
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="animate-fade-in">
              <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <h2 className="font-display text-xl font-semibold">Manage Templates</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Downloads</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {templates.map((template) => (
                        <tr key={template.id} className="border-t border-border/50 hover:bg-muted/30">
                          <td className="p-4 text-foreground">{template.title}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary capitalize">
                              {template.category}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">{template.download_count || 0}</td>
                          <td className="p-4 text-muted-foreground text-sm">
                            {new Date(template.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTemplate(template)}
                              className="text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="animate-fade-in space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Page Views */}
                <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                  <div className="p-4 border-b border-border/50">
                    <h3 className="font-display font-semibold">Recent Page Views</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {pageViews.slice(0, 20).map((view) => (
                      <div key={view.id} className="p-3 border-b border-border/30 last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{view.page_path}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(view.created_at).toLocaleString()}
                          </span>
                        </div>
                        {view.user_id && (
                          <span className="text-xs text-primary">User: {view.user_id.slice(0, 8)}...</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Template Clicks */}
                <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                  <div className="p-4 border-b border-border/50">
                    <h3 className="font-display font-semibold">Template Clicks</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {templateClicks.slice(0, 20).map((click) => (
                      <div key={click.id} className="p-3 border-b border-border/30 last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{click.templates?.title || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(click.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="animate-fade-in">
              <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <h2 className="font-display text-xl font-semibold">Registered Users ({profiles.length})</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((profile) => (
                        <tr key={profile.id} className="border-t border-border/50 hover:bg-muted/30">
                          <td className="p-4 text-foreground">{profile.email || 'N/A'}</td>
                          <td className="p-4 text-muted-foreground">{profile.full_name || 'N/A'}</td>
                          <td className="p-4 text-muted-foreground text-sm">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="animate-fade-in">
              <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <h2 className="font-display text-xl font-semibold">User Reports ({chatReports.length})</h2>
                </div>
                
                <div className="divide-y divide-border/50">
                  {chatReports.map((report) => (
                    <div key={report.id} className="p-4 hover:bg-muted/30">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-foreground">
                              {report.user_email || 'Anonymous'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              report.status === 'pending' 
                                ? 'bg-nova-orange/10 text-nova-orange' 
                                : report.status === 'resolved'
                                ? 'bg-nova-green/10 text-nova-green'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{report.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(report.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                            className="text-nova-green hover:text-nova-green hover:bg-nova-green/10"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {chatReports.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No reports yet
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Edit Template Modal */}
      {isEditing && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card rounded-xl border border-border/50 p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold">Edit Template</h2>
              <button onClick={handleCancelEdit} className="p-2 hover:bg-muted rounded-lg">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Title</Label>
                <Input
                  id="editTitle"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="bg-muted"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger className="bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4" />
                        Software
                      </div>
                    </SelectItem>
                    <SelectItem value="games">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4" />
                        Games
                      </div>
                    </SelectItem>
                    <SelectItem value="files">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        Files
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editExternalLink" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  External Link
                </Label>
                <Input
                  id="editExternalLink"
                  value={editExternalLink}
                  onChange={(e) => setEditExternalLink(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editLinkTitle">Link Title</Label>
                <Input
                  id="editLinkTitle"
                  value={editLinkTitle}
                  onChange={(e) => setEditLinkTitle(e.target.value)}
                  placeholder="Visit Website"
                  className="bg-muted"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                  Cancel
                </Button>
                <Button variant="glow" onClick={handleSaveEdit} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
