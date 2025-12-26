CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: friendship_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.friendship_status AS ENUM (
    'pending',
    'accepted',
    'blocked'
);


--
-- Name: gift_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gift_status AS ENUM (
    'pending',
    'accepted',
    'rejected'
);


--
-- Name: quiz_difficulty; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quiz_difficulty AS ENUM (
    'easy',
    'medium',
    'hard'
);


--
-- Name: quiz_match_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quiz_match_status AS ENUM (
    'waiting',
    'in_progress',
    'finished',
    'cancelled'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'nickname');
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: decision_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decision_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scenario_id uuid NOT NULL,
    option_text text NOT NULL,
    impact_score integer DEFAULT 0,
    cost_score integer DEFAULT 0,
    risk_score integer DEFAULT 0,
    feedback text NOT NULL,
    is_optimal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: decision_scenarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decision_scenarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid,
    title text NOT NULL,
    context text NOT NULL,
    difficulty text DEFAULT 'medium'::text NOT NULL,
    xp_reward integer DEFAULT 50,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: friend_group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.friend_group_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: friend_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.friend_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    icon text DEFAULT '👥'::text,
    max_members integer DEFAULT 10,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: friendships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.friendships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    requester_id uuid NOT NULL,
    addressee_id uuid NOT NULL,
    status public.friendship_status DEFAULT 'pending'::public.friendship_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: gifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gifts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    item_id uuid NOT NULL,
    message text,
    status public.gift_status DEFAULT 'pending'::public.gift_status NOT NULL,
    coins_spent integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    responded_at timestamp with time zone
);


--
-- Name: leaderboard; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leaderboard (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    player_name text NOT NULL,
    game_type text NOT NULL,
    score integer NOT NULL,
    difficulty text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    CONSTRAINT leaderboard_game_type_check CHECK ((game_type = ANY (ARRAY['memory'::text, 'snake'::text, 'dino'::text])))
);


--
-- Name: marketplace_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marketplace_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    icon text NOT NULL,
    category text DEFAULT 'avatar'::text NOT NULL,
    price integer NOT NULL,
    rarity text DEFAULT 'common'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    nickname text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    avatar_url text,
    selected_title text
);


--
-- Name: quiz_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_id uuid NOT NULL,
    user_id uuid NOT NULL,
    question_id uuid NOT NULL,
    answer_index integer NOT NULL,
    is_correct boolean NOT NULL,
    time_taken integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quiz_bets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_bets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    match_id uuid NOT NULL,
    user_id uuid NOT NULL,
    bet_on_player_id uuid NOT NULL,
    coins_bet integer NOT NULL,
    coins_won integer,
    is_won boolean,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quiz_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    icon text DEFAULT '📚'::text NOT NULL,
    description text,
    color text DEFAULT '#3B82F6'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quiz_matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL,
    player1_id uuid NOT NULL,
    player2_id uuid,
    player1_score integer DEFAULT 0 NOT NULL,
    player2_score integer DEFAULT 0 NOT NULL,
    status public.quiz_match_status DEFAULT 'waiting'::public.quiz_match_status NOT NULL,
    questions jsonb,
    current_question integer DEFAULT 0 NOT NULL,
    winner_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    finished_at timestamp with time zone,
    game_mode text DEFAULT 'normal'::text
);


--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL,
    question text NOT NULL,
    options jsonb NOT NULL,
    correct_answer integer NOT NULL,
    explanation text,
    difficulty public.quiz_difficulty DEFAULT 'medium'::public.quiz_difficulty NOT NULL,
    xp_reward integer DEFAULT 10 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: skill_tree; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill_tree (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    icon text DEFAULT '🎯'::text NOT NULL,
    category_id uuid,
    parent_skill_id uuid,
    level integer DEFAULT 1 NOT NULL,
    xp_required integer DEFAULT 100 NOT NULL,
    is_unlocked_by_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: symbolic_rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.symbolic_rewards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    icon text NOT NULL,
    type text NOT NULL,
    coins_required integer DEFAULT 0,
    level_required integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    achievement_id text NOT NULL,
    unlocked_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_competency_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_competency_profile (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    decision_speed_avg integer DEFAULT 0,
    risk_tolerance numeric(3,2) DEFAULT 0.50,
    impact_focus numeric(3,2) DEFAULT 0.50,
    consistency_score numeric(3,2) DEFAULT 0.00,
    total_scenarios_completed integer DEFAULT 0,
    total_correct_decisions integer DEFAULT 0,
    strengths text[],
    weaknesses text[],
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_decision_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_decision_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    scenario_id uuid NOT NULL,
    option_id uuid NOT NULL,
    time_taken integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_inventory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    item_id uuid NOT NULL,
    purchased_at timestamp with time zone DEFAULT now() NOT NULL,
    is_equipped boolean DEFAULT false NOT NULL
);


--
-- Name: user_rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_rewards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reward_id uuid NOT NULL,
    status text DEFAULT 'pending'::text,
    redeemed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_skills (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    skill_id uuid NOT NULL,
    is_unlocked boolean DEFAULT false,
    xp_earned integer DEFAULT 0,
    mastery_level integer DEFAULT 0,
    unlocked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    total_games_played integer DEFAULT 0 NOT NULL,
    memory_games_played integer DEFAULT 0 NOT NULL,
    memory_best_moves jsonb DEFAULT '{}'::jsonb NOT NULL,
    memory_best_time jsonb DEFAULT '{}'::jsonb NOT NULL,
    snake_games_played integer DEFAULT 0 NOT NULL,
    snake_best_score integer DEFAULT 0 NOT NULL,
    snake_max_length integer DEFAULT 1 NOT NULL,
    dino_games_played integer DEFAULT 0 NOT NULL,
    dino_best_score integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tetris_games_played integer DEFAULT 0 NOT NULL,
    tetris_best_score integer DEFAULT 0 NOT NULL,
    tetris_lines_cleared integer DEFAULT 0 NOT NULL,
    tetris_best_level integer DEFAULT 1 NOT NULL,
    coins integer DEFAULT 0 NOT NULL,
    xp integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL
);


--
-- Name: user_streaks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_streaks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    longest_streak integer DEFAULT 0 NOT NULL,
    last_played_at timestamp with time zone,
    last_claimed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_titles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_titles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title_id text NOT NULL,
    unlocked_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: decision_options decision_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decision_options
    ADD CONSTRAINT decision_options_pkey PRIMARY KEY (id);


--
-- Name: decision_scenarios decision_scenarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decision_scenarios
    ADD CONSTRAINT decision_scenarios_pkey PRIMARY KEY (id);


--
-- Name: friend_group_members friend_group_members_group_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friend_group_members
    ADD CONSTRAINT friend_group_members_group_id_user_id_key UNIQUE (group_id, user_id);


--
-- Name: friend_group_members friend_group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friend_group_members
    ADD CONSTRAINT friend_group_members_pkey PRIMARY KEY (id);


--
-- Name: friend_groups friend_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friend_groups
    ADD CONSTRAINT friend_groups_pkey PRIMARY KEY (id);


--
-- Name: friendships friendships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_pkey PRIMARY KEY (id);


--
-- Name: friendships friendships_requester_id_addressee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friendships
    ADD CONSTRAINT friendships_requester_id_addressee_id_key UNIQUE (requester_id, addressee_id);


--
-- Name: gifts gifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gifts
    ADD CONSTRAINT gifts_pkey PRIMARY KEY (id);


--
-- Name: leaderboard leaderboard_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboard
    ADD CONSTRAINT leaderboard_pkey PRIMARY KEY (id);


--
-- Name: leaderboard leaderboard_user_game_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboard
    ADD CONSTRAINT leaderboard_user_game_unique UNIQUE (user_id, game_type, difficulty);


--
-- Name: marketplace_items marketplace_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marketplace_items
    ADD CONSTRAINT marketplace_items_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: quiz_answers quiz_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_answers
    ADD CONSTRAINT quiz_answers_pkey PRIMARY KEY (id);


--
-- Name: quiz_bets quiz_bets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_bets
    ADD CONSTRAINT quiz_bets_pkey PRIMARY KEY (id);


--
-- Name: quiz_categories quiz_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_categories
    ADD CONSTRAINT quiz_categories_pkey PRIMARY KEY (id);


--
-- Name: quiz_matches quiz_matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_matches
    ADD CONSTRAINT quiz_matches_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: skill_tree skill_tree_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_tree
    ADD CONSTRAINT skill_tree_pkey PRIMARY KEY (id);


--
-- Name: symbolic_rewards symbolic_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.symbolic_rewards
    ADD CONSTRAINT symbolic_rewards_pkey PRIMARY KEY (id);


--
-- Name: leaderboard unique_user_game_difficulty; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboard
    ADD CONSTRAINT unique_user_game_difficulty UNIQUE NULLS NOT DISTINCT (user_id, game_type, difficulty);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_user_id_achievement_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id);


--
-- Name: user_competency_profile user_competency_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_competency_profile
    ADD CONSTRAINT user_competency_profile_pkey PRIMARY KEY (id);


--
-- Name: user_competency_profile user_competency_profile_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_competency_profile
    ADD CONSTRAINT user_competency_profile_user_id_key UNIQUE (user_id);


--
-- Name: user_decision_answers user_decision_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_decision_answers
    ADD CONSTRAINT user_decision_answers_pkey PRIMARY KEY (id);


--
-- Name: user_inventory user_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_inventory
    ADD CONSTRAINT user_inventory_pkey PRIMARY KEY (id);


--
-- Name: user_inventory user_inventory_user_id_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_inventory
    ADD CONSTRAINT user_inventory_user_id_item_id_key UNIQUE (user_id, item_id);


--
-- Name: user_rewards user_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_rewards
    ADD CONSTRAINT user_rewards_pkey PRIMARY KEY (id);


--
-- Name: user_skills user_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_pkey PRIMARY KEY (id);


--
-- Name: user_skills user_skills_user_id_skill_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_user_id_skill_id_key UNIQUE (user_id, skill_id);


--
-- Name: user_stats user_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_pkey PRIMARY KEY (id);


--
-- Name: user_stats user_stats_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_user_id_key UNIQUE (user_id);


--
-- Name: user_streaks user_streaks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_streaks
    ADD CONSTRAINT user_streaks_pkey PRIMARY KEY (id);


--
-- Name: user_streaks user_streaks_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_streaks
    ADD CONSTRAINT user_streaks_user_id_key UNIQUE (user_id);


--
-- Name: user_titles user_titles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_titles
    ADD CONSTRAINT user_titles_pkey PRIMARY KEY (id);


--
-- Name: user_titles user_titles_user_id_title_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_titles
    ADD CONSTRAINT user_titles_user_id_title_id_key UNIQUE (user_id, title_id);


--
-- Name: idx_leaderboard_game_score; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leaderboard_game_score ON public.leaderboard USING btree (game_type, score DESC);


--
-- Name: friendships update_friendships_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON public.friendships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_stats update_user_stats_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_streaks update_user_streaks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON public.user_streaks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: decision_options decision_options_scenario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decision_options
    ADD CONSTRAINT decision_options_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.decision_scenarios(id) ON DELETE CASCADE;


--
-- Name: decision_scenarios decision_scenarios_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decision_scenarios
    ADD CONSTRAINT decision_scenarios_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.quiz_categories(id);


--
-- Name: friend_group_members friend_group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friend_group_members
    ADD CONSTRAINT friend_group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.friend_groups(id) ON DELETE CASCADE;


--
-- Name: gifts gifts_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gifts
    ADD CONSTRAINT gifts_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.marketplace_items(id);


--
-- Name: leaderboard leaderboard_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboard
    ADD CONSTRAINT leaderboard_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: quiz_answers quiz_answers_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_answers
    ADD CONSTRAINT quiz_answers_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.quiz_matches(id) ON DELETE CASCADE;


--
-- Name: quiz_answers quiz_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_answers
    ADD CONSTRAINT quiz_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id);


--
-- Name: quiz_bets quiz_bets_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_bets
    ADD CONSTRAINT quiz_bets_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.quiz_matches(id) ON DELETE CASCADE;


--
-- Name: quiz_matches quiz_matches_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_matches
    ADD CONSTRAINT quiz_matches_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.quiz_categories(id);


--
-- Name: quiz_questions quiz_questions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.quiz_categories(id) ON DELETE CASCADE;


--
-- Name: skill_tree skill_tree_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_tree
    ADD CONSTRAINT skill_tree_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.quiz_categories(id);


--
-- Name: skill_tree skill_tree_parent_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_tree
    ADD CONSTRAINT skill_tree_parent_skill_id_fkey FOREIGN KEY (parent_skill_id) REFERENCES public.skill_tree(id);


--
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_decision_answers user_decision_answers_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_decision_answers
    ADD CONSTRAINT user_decision_answers_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.decision_options(id);


--
-- Name: user_decision_answers user_decision_answers_scenario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_decision_answers
    ADD CONSTRAINT user_decision_answers_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.decision_scenarios(id);


--
-- Name: user_inventory user_inventory_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_inventory
    ADD CONSTRAINT user_inventory_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.marketplace_items(id) ON DELETE CASCADE;


--
-- Name: user_inventory user_inventory_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_inventory
    ADD CONSTRAINT user_inventory_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_rewards user_rewards_reward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_rewards
    ADD CONSTRAINT user_rewards_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES public.symbolic_rewards(id);


--
-- Name: user_skills user_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skill_tree(id);


--
-- Name: user_stats user_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: leaderboard Anyone can add score; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can add score" ON public.leaderboard FOR INSERT WITH CHECK (true);


--
-- Name: leaderboard Anyone can view leaderboard; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard FOR SELECT USING (true);


--
-- Name: decision_options Anyone can view options; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view options" ON public.decision_options FOR SELECT USING (true);


--
-- Name: symbolic_rewards Anyone can view rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view rewards" ON public.symbolic_rewards FOR SELECT USING (true);


--
-- Name: decision_scenarios Anyone can view scenarios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view scenarios" ON public.decision_scenarios FOR SELECT USING (true);


--
-- Name: skill_tree Anyone can view skill tree; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view skill tree" ON public.skill_tree FOR SELECT USING (true);


--
-- Name: quiz_categories Categorias são públicas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Categorias são públicas" ON public.quiz_categories FOR SELECT USING ((is_active = true));


--
-- Name: gifts Destinatários podem atualizar presentes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Destinatários podem atualizar presentes" ON public.gifts FOR UPDATE USING ((auth.uid() = receiver_id));


--
-- Name: friend_group_members Donos ou próprio membro pode remover; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Donos ou próprio membro pode remover" ON public.friend_group_members FOR DELETE USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.friend_groups
  WHERE ((friend_groups.id = friend_group_members.group_id) AND (friend_groups.owner_id = auth.uid()))))));


--
-- Name: friend_group_members Donos podem adicionar membros; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Donos podem adicionar membros" ON public.friend_group_members FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.friend_groups
  WHERE ((friend_groups.id = friend_group_members.group_id) AND (friend_groups.owner_id = auth.uid())))));


--
-- Name: friend_groups Donos podem atualizar grupos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Donos podem atualizar grupos" ON public.friend_groups FOR UPDATE USING ((auth.uid() = owner_id));


--
-- Name: friend_groups Donos podem criar grupos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Donos podem criar grupos" ON public.friend_groups FOR INSERT WITH CHECK ((auth.uid() = owner_id));


--
-- Name: friend_groups Donos podem deletar grupos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Donos podem deletar grupos" ON public.friend_groups FOR DELETE USING ((auth.uid() = owner_id));


--
-- Name: friend_groups Grupos são públicos para visualização; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Grupos são públicos para visualização" ON public.friend_groups FOR SELECT USING (true);


--
-- Name: marketplace_items Itens do marketplace são públicos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Itens do marketplace são públicos" ON public.marketplace_items FOR SELECT USING ((is_active = true));


--
-- Name: quiz_matches Jogadores podem atualizar próprias partidas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Jogadores podem atualizar próprias partidas" ON public.quiz_matches FOR UPDATE USING (((auth.uid() = player1_id) OR (auth.uid() = player2_id)));


--
-- Name: friend_group_members Membros são públicos para visualização; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Membros são públicos para visualização" ON public.friend_group_members FOR SELECT USING (true);


--
-- Name: quiz_questions Perguntas são públicas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Perguntas são públicas" ON public.quiz_questions FOR SELECT USING (true);


--
-- Name: profiles Qualquer um pode ver perfis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Qualquer um pode ver perfis" ON public.profiles FOR SELECT USING (true);


--
-- Name: quiz_bets Sistema pode atualizar apostas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Sistema pode atualizar apostas" ON public.quiz_bets FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_decision_answers Users can insert their own decisions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own decisions" ON public.user_decision_answers FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_competency_profile Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.user_competency_profile FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_rewards Users can insert their own rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own rewards" ON public.user_rewards FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_skills Users can insert their own skills; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own skills" ON public.user_skills FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_competency_profile Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.user_competency_profile FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_skills Users can update their own skills; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own skills" ON public.user_skills FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_decision_answers Users can view their own decisions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own decisions" ON public.user_decision_answers FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_competency_profile Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.user_competency_profile FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_rewards Users can view their own rewards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own rewards" ON public.user_rewards FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_skills Users can view their own skills; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own skills" ON public.user_skills FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: quiz_matches Usuários autenticados podem criar partidas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários autenticados podem criar partidas" ON public.quiz_matches FOR INSERT WITH CHECK ((auth.uid() = player1_id));


--
-- Name: user_inventory Usuários podem adicionar ao próprio inventário; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem adicionar ao próprio inventário" ON public.user_inventory FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: friendships Usuários podem atualizar próprias amizades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem atualizar próprias amizades" ON public.friendships FOR UPDATE USING (((auth.uid() = requester_id) OR (auth.uid() = addressee_id)));


--
-- Name: user_stats Usuários podem atualizar próprias estatísticas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem atualizar próprias estatísticas" ON public.user_stats FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_inventory Usuários podem atualizar próprio inventário; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem atualizar próprio inventário" ON public.user_inventory FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Usuários podem atualizar próprio perfil; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: user_streaks Usuários podem atualizar próprio streak; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem atualizar próprio streak" ON public.user_streaks FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: quiz_bets Usuários podem criar apostas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem criar apostas" ON public.quiz_bets FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_achievements Usuários podem criar próprias conquistas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem criar próprias conquistas" ON public.user_achievements FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_stats Usuários podem criar próprias estatísticas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem criar próprias estatísticas" ON public.user_stats FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Usuários podem criar próprio perfil; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem criar próprio perfil" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: user_streaks Usuários podem criar próprio streak; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem criar próprio streak" ON public.user_streaks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_titles Usuários podem criar próprios títulos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem criar próprios títulos" ON public.user_titles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: quiz_answers Usuários podem criar respostas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem criar respostas" ON public.quiz_answers FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: friendships Usuários podem deletar próprias amizades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem deletar próprias amizades" ON public.friendships FOR DELETE USING (((auth.uid() = requester_id) OR (auth.uid() = addressee_id)));


--
-- Name: gifts Usuários podem enviar presentes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem enviar presentes" ON public.gifts FOR INSERT WITH CHECK ((auth.uid() = sender_id));


--
-- Name: friendships Usuários podem enviar solicitações; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem enviar solicitações" ON public.friendships FOR INSERT WITH CHECK ((auth.uid() = requester_id));


--
-- Name: quiz_matches Usuários podem ver partidas públicas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver partidas públicas" ON public.quiz_matches FOR SELECT USING (true);


--
-- Name: gifts Usuários podem ver presentes enviados/recebidos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver presentes enviados/recebidos" ON public.gifts FOR SELECT USING (((auth.uid() = sender_id) OR (auth.uid() = receiver_id)));


--
-- Name: friendships Usuários podem ver próprias amizades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver próprias amizades" ON public.friendships FOR SELECT USING (((auth.uid() = requester_id) OR (auth.uid() = addressee_id)));


--
-- Name: quiz_bets Usuários podem ver próprias apostas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver próprias apostas" ON public.quiz_bets FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_achievements Usuários podem ver próprias conquistas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver próprias conquistas" ON public.user_achievements FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_stats Usuários podem ver próprias estatísticas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver próprias estatísticas" ON public.user_stats FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: quiz_answers Usuários podem ver próprias respostas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver próprias respostas" ON public.quiz_answers FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_inventory Usuários podem ver próprio inventário; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver próprio inventário" ON public.user_inventory FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_streaks Usuários podem ver próprio streak; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver próprio streak" ON public.user_streaks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_titles Usuários podem ver próprios títulos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Usuários podem ver próprios títulos" ON public.user_titles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: decision_options; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.decision_options ENABLE ROW LEVEL SECURITY;

--
-- Name: decision_scenarios; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.decision_scenarios ENABLE ROW LEVEL SECURITY;

--
-- Name: friend_group_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.friend_group_members ENABLE ROW LEVEL SECURITY;

--
-- Name: friend_groups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.friend_groups ENABLE ROW LEVEL SECURITY;

--
-- Name: friendships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

--
-- Name: gifts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

--
-- Name: leaderboard; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

--
-- Name: marketplace_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_bets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_bets ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_matches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_matches ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: skill_tree; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.skill_tree ENABLE ROW LEVEL SECURITY;

--
-- Name: symbolic_rewards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.symbolic_rewards ENABLE ROW LEVEL SECURITY;

--
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: user_competency_profile; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_competency_profile ENABLE ROW LEVEL SECURITY;

--
-- Name: user_decision_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_decision_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: user_inventory; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

--
-- Name: user_rewards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

--
-- Name: user_skills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

--
-- Name: user_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: user_streaks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

--
-- Name: user_titles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;