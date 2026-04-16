-- =========================
-- GROUPS
-- =========================
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_groups_parent ON public.groups(parent_id);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Groups are viewable by everyone"
  ON public.groups FOR SELECT
  USING (true);

-- Only admins can manage groups
CREATE POLICY "Admins can manage groups"
  ON public.groups FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================
-- POSTS
-- =========================
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  caption TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_group ON public.posts(group_id, created_at DESC);
CREATE INDEX idx_posts_author ON public.posts(author_id, created_at DESC);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id);

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- COMMENTS
-- =========================
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_post ON public.comments(post_id, created_at);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id);

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- STORAGE: art-images bucket (public)
-- =========================
INSERT INTO storage.buckets (id, name, public)
VALUES ('art-images', 'art-images', true);

CREATE POLICY "Art images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'art-images');

CREATE POLICY "Users can upload to their own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'art-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own art images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'art-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own art images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'art-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =========================
-- SEED GROUPS
-- =========================
-- Cosplay parent
WITH cosplay AS (
  INSERT INTO public.groups (slug, name, description, icon, sort_order)
  VALUES ('cosplay', 'Cosplay', 'Costumes, props, and characters from games, movies, shows, and books', 'Drama', 0)
  RETURNING id
)
INSERT INTO public.groups (parent_id, slug, name, description, icon, sort_order)
SELECT id, slug, name, description, icon, sort_order FROM cosplay,
  (VALUES
    ('cosplay-games',  'Video Games',  'Cosplay from video games',                    'Gamepad2', 1),
    ('cosplay-movies', 'Movies',        'Cosplay from movies',                         'Film',     2),
    ('cosplay-shows',  'Shows',         'Cosplay from TV shows and anime',             'Tv',       3),
    ('cosplay-books',  'Books',         'Cosplay from books, comics, and manga',       'BookOpen', 4)
  ) AS s(slug, name, description, icon, sort_order);

-- Craft top-level groups
INSERT INTO public.groups (slug, name, description, icon, sort_order) VALUES
  ('sculpture',         'Sculpture',         'Sculpted works in any material',       'Box',          10),
  ('painting-drawing',  'Painting & Drawing','Paintings, drawings, illustrations',   'Palette',      11),
  ('clay-pottery',      'Clay & Pottery',    'Hand-built and wheel-thrown ceramics', 'CircleDot',    12),
  ('3d-printed',        '3D Printed',        '3D printed art and props',             'Boxes',        13),
  ('puppets-dolls',     'Puppets & Dolls',   'Handmade puppets, dolls, and plush',   'Smile',        14),
  ('robots',            'Robots',            'Hand-built robots and animatronics',   'Bot',          15),
  ('clothes',           'Clothes',           'Sewn, knitted, and hand-made clothing','Shirt',        16),
  ('crochet',           'Crochet',           'Crochet and amigurumi',                'Heart',        17);