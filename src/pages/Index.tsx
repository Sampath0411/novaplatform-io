import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/ChatBot';
import TemplateCard from '@/components/TemplateCard';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Folder, Gamepad2, FileCode, Loader2, Download } from 'lucide-react';

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

const Index: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Track page view
    const trackPageView = async () => {
      await supabase.from('page_views').insert({
        user_id: user?.id || null,
        page_path: '/',
        user_agent: navigator.userAgent
      });
    };
    trackPageView();

    // Fetch templates
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && data) {
        setTemplates(data);
      }
      setIsLoading(false);
    };

    fetchTemplates();
  }, [user]);

  const categories = [
    { name: 'Software', icon: FileCode, color: 'text-primary', href: '/software', count: templates.filter(t => t.category === 'software').length },
    { name: 'Games', icon: Gamepad2, color: 'text-nova-purple', href: '/games', count: templates.filter(t => t.category === 'games').length },
    { name: 'Files', icon: Folder, color: 'text-nova-green', href: '/files', count: templates.filter(t => t.category === 'files').length },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-morph" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-nova-purple/5 rounded-full blur-3xl animate-morph" style={{ animationDelay: '-4s' }} />
          
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-3 h-3 bg-primary rounded-full animate-float opacity-60" />
          <div className="absolute top-40 right-32 w-4 h-4 bg-secondary rounded-full animate-float opacity-40" style={{ animationDelay: '-1s' }} />
          <div className="absolute bottom-32 left-40 w-2 h-2 bg-nova-green rounded-full animate-float opacity-50" style={{ animationDelay: '-2s' }} />
          <div className="absolute top-1/3 right-20 w-5 h-5 bg-nova-pink/50 rounded-full animate-bounce-gentle" />
          <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-nova-cyan/50 rounded-full animate-float" style={{ animationDelay: '-0.5s' }} />
          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-nova-orange/50 rounded-full animate-bounce-gentle" style={{ animationDelay: '-1.5s' }} />
          
          {/* Animated rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-primary/10 rounded-full animate-spin-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-secondary/5 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '12s' }} />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8 animate-scale-bounce hover:scale-105 transition-transform cursor-default">
                <Sparkles className="h-4 w-4 text-primary animate-wiggle" />
                <span className="text-sm text-primary font-medium">Discover Premium Content</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <span className="text-foreground">Welcome to </span>
                <span className="text-gradient animate-glow-pulse">Nova's Platform</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Your ultimate destination for premium software, games, and digital files. 
                Explore our curated collection and download instantly.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Button variant="glow" size="xl" asChild className="group hover:scale-105 transition-transform">
                  <Link to="/software">
                    <Download className="h-5 w-5 mr-2 group-hover:animate-bounce-gentle" />
                    Browse Collection
                  </Link>
                </Button>
                {!user && (
                  <Button variant="outline" size="xl" asChild className="hover:scale-105 transition-transform">
                    <Link to="/auth?mode=signup">
                      Get Started
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 border-t border-border/50 relative overflow-hidden">
          {/* Subtle animated background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12 animate-fade-in-up">
              Explore <span className="text-gradient">Categories</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {categories.map((category, index) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="group relative bg-card rounded-2xl border border-border/50 p-8 text-center card-hover animate-fade-in-up hover:border-primary/30 transition-all duration-500"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ${category.color}`}>
                    <category.icon className="h-8 w-8 group-hover:animate-bounce-gentle" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} items available
                  </p>
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/20 transition-all duration-300" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-500" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Templates Section */}
        <section className="py-16 border-t border-border/50 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12 animate-fade-in">
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                Latest <span className="text-gradient">Uploads</span>
              </h2>
              <Button variant="ghost" asChild className="group hover:scale-105 transition-transform">
                <Link to="/software">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : templates.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template, index) => (
                  <div key={template.id} className="animate-fade-in-up hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                    <TemplateCard template={template} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card/50 rounded-2xl border border-border/50 animate-fade-in">
                <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-bounce-gentle" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">No uploads yet</h3>
                <p className="text-muted-foreground">Check back later for new content!</p>
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-t border-border/50 bg-muted/20 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-primary/10 to-transparent rounded-full animate-pulse-glow" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { label: 'Downloads', value: '10K+' },
                { label: 'Files', value: `${templates.length}` },
                { label: 'Categories', value: '3' },
                { label: 'Users', value: '1K+' },
              ].map((stat, index) => (
                <div key={stat.label} className="text-center animate-fade-in-up group hover:scale-110 transition-transform duration-300 cursor-default" style={{ animationDelay: `${index * 0.1}s` }}>
                  <p className="font-display text-3xl md:text-4xl font-bold text-gradient mb-1 group-hover:animate-glow-pulse">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ChatBot />
      </div>
    </PageTransition>
  );
};

export default Index;
