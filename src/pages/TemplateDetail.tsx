import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Download, 
  ArrowLeft, 
  FileCode, 
  Gamepad2, 
  Folder,
  HardDrive,
  Calendar,
  Eye,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string | null;
  file_size: number | null;
  thumbnail_url: string | null;
  download_count: number | null;
  external_link: string | null;
  link_title: string | null;
  created_at: string;
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'games':
      return <Gamepad2 className="h-6 w-6" />;
    case 'software':
      return <FileCode className="h-6 w-6" />;
    default:
      return <Folder className="h-6 w-6" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'games':
      return 'text-nova-purple bg-nova-purple/10 border-nova-purple/30';
    case 'software':
      return 'text-primary bg-primary/10 border-primary/30';
    default:
      return 'text-nova-green bg-nova-green/10 border-nova-green/30';
  }
};

const TemplateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching template:', error);
        toast.error('Failed to load template');
        navigate('/');
        return;
      }

      if (!data) {
        toast.error('Template not found');
        navigate('/');
        return;
      }

      setTemplate(data);
      setIsLoading(false);

      // Track click
      try {
        await supabase.from('template_clicks').insert({
          template_id: id,
          user_id: user?.id || null
        });
      } catch (e) {
        console.error('Error tracking click:', e);
      }
    };

    fetchTemplate();
  }, [id, user, navigate]);

  const handleDownload = async () => {
    if (!template?.file_url) {
      toast.error('Download not available');
      return;
    }

    // Update download count
    await supabase
      .from('templates')
      .update({ download_count: (template.download_count || 0) + 1 })
      .eq('id', template.id);

    window.open(template.file_url, '_blank');
    toast.success('Download started!');
    
    setTemplate(prev => prev ? { ...prev, download_count: (prev.download_count || 0) + 1 } : null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-morph" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute top-20 left-20 w-2 h-2 bg-primary rounded-full animate-float opacity-60" />
          <div className="absolute bottom-40 right-32 w-3 h-3 bg-nova-purple rounded-full animate-bounce-gentle opacity-40" />
        </div>
        
        <Header />
        
        <main className="flex-1 py-8 relative z-10">
          <div className="container mx-auto px-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6 text-muted-foreground hover:text-foreground animate-fade-in-left group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Thumbnail Section */}
              <div className="space-y-4 animate-fade-in-left" style={{ animationDelay: '0.1s' }}>
                <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border border-border/50 group hover:border-primary/30 transition-all duration-500">
                  {template.thumbnail_url ? (
                    <img
                      src={template.thumbnail_url}
                      alt={template.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-background">
                      <div className="animate-bounce-gentle">
                        {getCategoryIcon(template.category)}
                      </div>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-medium border ${getCategoryColor(template.category)} animate-fade-in`}>
                    <span className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      {template.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="space-y-6 animate-fade-in-right" style={{ animationDelay: '0.2s' }}>
                <div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2 animate-fade-in-up">
                    {template.title}
                  </h1>
                  
                  {template.description && (
                    <p className="text-muted-foreground text-lg leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                      {template.description}
                    </p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card rounded-xl border border-border/50 p-4 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
                    <div className="flex items-center gap-3 text-muted-foreground mb-1">
                      <HardDrive className="h-5 w-5 text-primary animate-bounce-gentle" />
                      <span className="text-sm">File Size</span>
                    </div>
                    <p className="font-display text-xl font-bold text-foreground">
                      {formatFileSize(template.file_size)}
                    </p>
                  </div>
                  
                  <div className="bg-card rounded-xl border border-border/50 p-4 hover:border-nova-green/30 transition-all duration-300 hover:scale-[1.02] animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center gap-3 text-muted-foreground mb-1">
                      <Eye className="h-5 w-5 text-nova-green animate-bounce-gentle" style={{ animationDelay: '-0.5s' }} />
                      <span className="text-sm">Downloads</span>
                    </div>
                    <p className="font-display text-xl font-bold text-foreground">
                      {template.download_count || 0}
                    </p>
                  </div>
                  
                  <div className="bg-card rounded-xl border border-border/50 p-4 col-span-2 hover:border-nova-purple/30 transition-all duration-300 hover:scale-[1.01] animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
                    <div className="flex items-center gap-3 text-muted-foreground mb-1">
                      <Calendar className="h-5 w-5 text-nova-purple animate-bounce-gentle" style={{ animationDelay: '-1s' }} />
                      <span className="text-sm">Uploaded On</span>
                    </div>
                    <p className="font-display text-xl font-bold text-foreground">
                      {new Date(template.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <Button 
                    variant="glow" 
                    size="lg" 
                    onClick={handleDownload}
                    className="flex-1 group hover:scale-105 transition-transform"
                    disabled={!template.file_url}
                  >
                    <Download className="h-5 w-5 mr-2 group-hover:animate-bounce-gentle" />
                    Download Now
                  </Button>
                  
                  {template.external_link && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => window.open(template.external_link!, '_blank')}
                      className="flex-1 group hover:scale-105 transition-transform"
                    >
                      <ExternalLink className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                      {template.link_title || 'Visit Link'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default TemplateDetail;
