import React from 'react';
import { Download, Eye, Folder, Gamepad2, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Template {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string | null;
  file_size: number | null;
  thumbnail_url: string | null;
  download_count: number | null;
}

interface TemplateCardProps {
  template: Template;
  onDownload?: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'games':
      return <Gamepad2 className="h-5 w-5" />;
    case 'software':
      return <FileCode className="h-5 w-5" />;
    default:
      return <Folder className="h-5 w-5" />;
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

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onDownload }) => {
  const { user } = useAuth();

  const handleClick = async () => {
    try {
      await supabase.from('template_clicks').insert({
        template_id: template.id,
        user_id: user?.id || null
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleDownload = async () => {
    if (!template.file_url) {
      toast.error('Download not available');
      return;
    }

    await handleClick();
    
    // Update download count
    await supabase.rpc('increment_download_count', { template_id: template.id }).catch(() => {});
    
    window.open(template.file_url, '_blank');
    toast.success('Download started!');
    onDownload?.();
  };

  return (
    <div 
      className="group relative bg-card rounded-xl border border-border/50 overflow-hidden card-hover"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {template.thumbnail_url ? (
          <img
            src={template.thumbnail_url}
            alt={template.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-background">
            {getCategoryIcon(template.category)}
          </div>
        )}
        
        {/* Category Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(template.category)}`}>
          {template.category}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <Button variant="glow" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {template.title}
        </h3>
        
        {template.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {template.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {template.download_count || 0} downloads
          </span>
          <span>{formatFileSize(template.file_size)}</span>
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-primary/30" />
    </div>
  );
};

export default TemplateCard;
