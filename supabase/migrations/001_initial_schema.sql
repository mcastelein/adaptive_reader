-- ============================================================================
-- I CAN — Initial database schema
-- Run this in Supabase SQL Editor (supabase.com → project → SQL Editor)
-- ============================================================================

-- ─── Profiles ────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific preferences and progress.
-- Auto-created on first Google sign-in via trigger.

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  preferred_language text not null default 'Chinese',
  current_level text not null default 'A1',
  internal_level integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ─── Reader Sessions ─────────────────────────────────────────────────────────
-- One row per story session (user clicks "Start Story").

create table reader_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  language text not null,
  level text not null,
  internal_level_start integer not null,
  internal_level_end integer,
  topic text not null,
  steps_completed integer not null default 0,
  quiz_correct integer not null default 0,
  quiz_total integer not null default 0,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

alter table reader_sessions enable row level security;

create policy "Users can read own reader sessions"
  on reader_sessions for select using (auth.uid() = user_id);

create policy "Users can insert own reader sessions"
  on reader_sessions for insert with check (auth.uid() = user_id);

create policy "Users can update own reader sessions"
  on reader_sessions for update using (auth.uid() = user_id);

create index idx_reader_sessions_user on reader_sessions(user_id, created_at desc);


-- ─── Conversation Sessions ───────────────────────────────────────────────────
-- One row per conversation. Messages stored as JSONB array.

create table conversation_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  language text not null,
  level text not null,
  topic text not null default 'Free conversation',
  messages jsonb not null default '[]'::jsonb,
  message_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table conversation_sessions enable row level security;

create policy "Users can read own conversations"
  on conversation_sessions for select using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on conversation_sessions for insert with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on conversation_sessions for update using (auth.uid() = user_id);

create index idx_conversation_sessions_user on conversation_sessions(user_id, created_at desc);


-- ─── Vocabulary Words ────────────────────────────────────────────────────────
-- Words encountered across reader, conversation, graded-input.
-- Feeds into the flashcard system.

create table vocabulary (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  language text not null,
  word text not null,
  pinyin text,
  translation text not null,
  source text not null, -- 'reader', 'conversation', 'graded-input'
  cefr_level text,
  familiarity integer not null default 0, -- 0=new, 1=seen, 2=learning, 3=known
  next_review_at timestamptz not null default now(),
  review_count integer not null default 0,
  correct_streak integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, language, word)
);

alter table vocabulary enable row level security;

create policy "Users can read own vocabulary"
  on vocabulary for select using (auth.uid() = user_id);

create policy "Users can insert own vocabulary"
  on vocabulary for insert with check (auth.uid() = user_id);

create policy "Users can update own vocabulary"
  on vocabulary for update using (auth.uid() = user_id);

create policy "Users can delete own vocabulary"
  on vocabulary for delete using (auth.uid() = user_id);

create index idx_vocabulary_user_lang on vocabulary(user_id, language);
create index idx_vocabulary_review on vocabulary(user_id, next_review_at) where familiarity < 3;


-- ─── Updated-at triggers ─────────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger set_conversation_sessions_updated_at
  before update on conversation_sessions
  for each row execute function update_updated_at();

create trigger set_vocabulary_updated_at
  before update on vocabulary
  for each row execute function update_updated_at();
