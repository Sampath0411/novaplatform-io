import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileCode, Gamepad2, Folder, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Template {
  id: string;
  title: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'games':
      return <Gamepad2 className="h-4 w-4" />;
    case 'software':
      return <FileCode className="h-4 w-4" />;
    default:
      return <Folder className="h-4 w-4" />;
  }
};

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTemplates = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('id, title, description, category, thumbnail_url')
        .ilike('title', `%${query}%`)
        .limit(5);

      if (!error && data) {
        setResults(data);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(searchTemplates, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (templateId: string) => {
    navigate(`/template/${templateId}`);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search templates..."
          className="pl-10 pr-10 bg-muted/50 border-border/50 focus:border-primary"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden z-50">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-border/30">
              {results.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {template.thumbnail_url ? (
                      <img
                        src={template.thumbnail_url}
                        alt={template.title}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      getCategoryIcon(template.category)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {template.title}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {template.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No templates found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
