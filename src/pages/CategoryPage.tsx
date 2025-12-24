import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/ChatBot';
import TemplateCard from '@/components/TemplateCard';
import PageTransition from '@/components/PageTransition';
import { Loader2, Folder, FileCode, Gamepad2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

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

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const categoryConfig = {
    software: { icon: FileCode, color: 'text-primary', label: 'Software' },
    games: { icon: Gamepad2, color: 'text-nova-purple', label: 'Games' },
    files: { icon: Folder, color: 'text-nova-green', label: 'Files' },
  };

  const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.files;
  const IconComponent = config.icon;

  useEffect(() => {
    // Track page view
    const trackPageView = async () => {
      await supabase.from('page_views').insert({
        user_id: user?.id || null,
        page_path: `/${category}`,
        user_agent: navigator.userAgent
      });
    };
    trackPageView();

    // Fetch templates
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTemplates(data);
        setFilteredTemplates(data);
      }
      setIsLoading(false);
    };

    fetchTemplates();
  }, [category, user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = templates.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTemplates(filtered);
    } else {
      setFilteredTemplates(templates);
    }
  }, [searchQuery, templates]);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted mb-6 ${config.color}`}>
                <IconComponent className="h-10 w-10" />
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                <span className="text-gradient">{config.label}</span>
              </h1>
              
              <p className="text-muted-foreground mb-8">
                Browse and download the latest {config.label.toLowerCase()} from our collection.
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${config.label.toLowerCase()}...`}
                  className="pl-12 h-12 bg-card border-border/50 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : filteredTemplates.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-6">
                  Showing {filteredTemplates.length} result{filteredTemplates.length !== 1 ? 's' : ''}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template, index) => (
                    <div key={template.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      <TemplateCard template={template} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-card/50 rounded-2xl border border-border/50">
                <IconComponent className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {searchQuery ? 'No results found' : 'No uploads yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try a different search term.' : 'Check back later for new content!'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <ChatBot />
      </div>
    </PageTransition>
  );
};

export default CategoryPage;
