-- Add external link and link title columns to templates table
ALTER TABLE public.templates 
ADD COLUMN external_link text,
ADD COLUMN link_title text;