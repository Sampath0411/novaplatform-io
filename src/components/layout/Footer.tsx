import React from 'react';
import { Instagram, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
              N
            </div>
            <span className="font-display font-semibold text-gradient">Nova's Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/_exotic_sampath.56"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
            >
              <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">@_exotic_sampath.56</span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2025 Nova's Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
