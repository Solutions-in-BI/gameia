/**
 * Hook para gerenciar o jogo de Quiz Battle
 * Integrado com useGameRewards para registro de atividades
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { useLevel } from "./useLevel";
import { useGameRewards } from "./useGameRewards";

export interface QuizCategory {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  color: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  difficulty: "easy" | "medium" | "hard";
  xp_reward: number;
  category_id: string;
}

export interface QuizMatch {
  id: string;
  category_id: string;
  player1_id: string;
  player2_id: string | null;
  player1_score: number;
  player2_score: number;
  status: "waiting" | "in_progress" | "finished" | "cancelled";
  questions: string[];
  current_question: number;
  winner_id: string | null;
}

interface UseQuizGame {
  categories: QuizCategory[];
  currentMatch: QuizMatch | null;
  currentQuestion: QuizQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  isLoading: boolean;
  isAnswering: boolean;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  timeLeft: number;
  streak: number;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  startGame: (categoryId: string, bet?: number) => Promise<void>;
  answerQuestion: (answerIndex: number) => Promise<void>;
  nextQuestion: () => void;
  endGame: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

const QUESTION_TIME = 15; // segundos por pergunta
const QUESTIONS_PER_GAME = 10;

export function useQuizGame(): UseQuizGame {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { addXP } = useLevel();
  const { completeGame } = useGameRewards();

  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [currentMatch, setCurrentMatch] = useState<QuizMatch | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [streak, setStreak] = useState(0);
  const [betAmount, setBetAmount] = useState(0);

  // Timer para cada pergunta
  useEffect(() => {
    if (currentMatch && currentMatch.status === "in_progress" && !isAnswering && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentMatch && !isAnswering) {
      // Tempo esgotado - resposta errada
      answerQuestion(-1);
    }
  }, [timeLeft, currentMatch, isAnswering]);

  // Busca categorias
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_categories")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Inicia o jogo
  const startGame = useCallback(async (categoryId: string, bet: number = 0) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para jogar o Quiz Battle",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setBetAmount(bet);

    try {
      // Busca perguntas da categoria
      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("category_id", categoryId);

      if (questionsError) throw questionsError;

      if (!questionsData || questionsData.length < QUESTIONS_PER_GAME) {
        toast({
          title: "Perguntas insuficientes",
          description: "Esta categoria ainda não tem perguntas suficientes.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Seleciona perguntas aleatórias
      const shuffled = [...questionsData].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, QUESTIONS_PER_GAME);
      const questionIds = selectedQuestions.map((q) => q.id);

      // Parse options de cada pergunta
      const parsedQuestions: QuizQuestion[] = selectedQuestions.map((q) => ({
        ...q,
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
      }));

      // Cria a partida
      const { data: matchData, error: matchError } = await supabase
        .from("quiz_matches")
        .insert({
          category_id: categoryId,
          player1_id: user.id,
          status: "in_progress",
          questions: questionIds,
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Se tiver aposta, registra
      if (bet > 0) {
        // Verifica se tem moedas suficientes
        const { data: stats } = await supabase
          .from("user_stats")
          .select("coins")
          .eq("user_id", user.id)
          .single();

        if (!stats || stats.coins < bet) {
          toast({
            title: "Moedas insuficientes",
            description: "Você não tem moedas suficientes para esta aposta.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Deduz moedas
        await supabase
          .from("user_stats")
          .update({ coins: stats.coins - bet })
          .eq("user_id", user.id);

        // Registra aposta
        await supabase.from("quiz_bets").insert({
          match_id: matchData.id,
          user_id: user.id,
          bet_on_player_id: user.id,
          coins_bet: bet,
        });
      }

      setQuestions(parsedQuestions);
      setCurrentMatch({
        ...matchData,
        questions: questionIds,
      } as QuizMatch);
      setQuestionIndex(0);
      setScore(0);
      setStreak(0);
      setTimeLeft(QUESTION_TIME);
      setSelectedAnswer(null);
      setIsCorrect(null);

      toast({
        title: "🎮 Quiz Battle iniciado!",
        description: bet > 0 ? `Aposta: ${bet} moedas` : "Boa sorte!",
      });
    } catch (err) {
      console.error("Erro ao iniciar jogo:", err);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o jogo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Responde pergunta
  const answerQuestion = useCallback(async (answerIndex: number) => {
    if (!currentMatch || !user || isAnswering) return;

    setIsAnswering(true);
    setSelectedAnswer(answerIndex);

    const currentQ = questions[questionIndex];
    const correct = answerIndex === currentQ.correct_answer;
    setIsCorrect(correct);

    if (correct) {
      const timeBonus = Math.floor(timeLeft * 2);
      const streakBonus = streak * 5;
      const basePoints = currentQ.difficulty === "hard" ? 30 : currentQ.difficulty === "medium" ? 20 : 10;
      const totalPoints = basePoints + timeBonus + streakBonus;

      setScore((prev) => prev + totalPoints);
      setStreak((prev) => prev + 1);

      // Registra resposta
      await supabase.from("quiz_answers").insert({
        match_id: currentMatch.id,
        user_id: user.id,
        question_id: currentQ.id,
        answer_index: answerIndex,
        is_correct: true,
        time_taken: (QUESTION_TIME - timeLeft) * 1000,
      });
    } else {
      setStreak(0);

      if (answerIndex >= 0) {
        await supabase.from("quiz_answers").insert({
          match_id: currentMatch.id,
          user_id: user.id,
          question_id: currentQ.id,
          answer_index: answerIndex,
          is_correct: false,
          time_taken: (QUESTION_TIME - timeLeft) * 1000,
        });
      }
    }
  }, [currentMatch, user, isAnswering, questions, questionIndex, timeLeft, streak]);

  // Próxima pergunta
  const nextQuestion = useCallback(() => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      setTimeLeft(QUESTION_TIME);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setIsAnswering(false);
    } else {
      endGame();
    }
  }, [questionIndex, questions.length]);

  // Finaliza o jogo
  const endGame = useCallback(async () => {
    if (!currentMatch || !user) return;

    try {
      // Atualiza a partida
      await supabase
        .from("quiz_matches")
        .update({
          status: "finished",
          player1_score: score,
          winner_id: user.id,
          finished_at: new Date().toISOString(),
        })
        .eq("id", currentMatch.id);

      // Calcula bônus de apostas
      let betBonus = 0;
      if (betAmount > 0) {
        const percentage = (score / (questions.length * 30)) * 100;
        if (percentage >= 70) {
          betBonus = betAmount * 2; // Ganha o dobro
          await supabase.from("quiz_bets")
            .update({ coins_won: betAmount * 2, is_won: true })
            .eq("match_id", currentMatch.id)
            .eq("user_id", user.id);
        } else if (percentage >= 50) {
          betBonus = betAmount; // Recupera a aposta
          await supabase.from("quiz_bets")
            .update({ coins_won: betAmount, is_won: true })
            .eq("match_id", currentMatch.id)
            .eq("user_id", user.id);
        } else {
          await supabase.from("quiz_bets")
            .update({ coins_won: 0, is_won: false })
            .eq("match_id", currentMatch.id)
            .eq("user_id", user.id);
        }
      }

      // Aplica bônus de aposta diretamente se houver
      if (betBonus > 0) {
        const { data: stats } = await supabase
          .from("user_stats")
          .select("coins")
          .eq("user_id", user.id)
          .single();

        if (stats) {
          await supabase
            .from("user_stats")
            .update({ coins: stats.coins + betBonus })
            .eq("user_id", user.id);
        }
      }

      // Usa completeGame para registrar XP, coins, activity e core_events
      const rewards = await completeGame({
        gameType: "quiz",
        score,
        metadata: {
          matchId: currentMatch.id,
          categoryId: currentMatch.category_id,
          questionsAnswered: questionIndex + 1,
          totalQuestions: questions.length,
          betAmount,
          betBonus
        }
      });

      const totalCoins = (rewards?.coins || 0) + betBonus;

      toast({
        title: "🎉 Jogo finalizado!",
        description: `Pontuação: ${score} | +${totalCoins} moedas | +${rewards?.xp || 0} XP`,
      });

      // Reset state
      setCurrentMatch(null);
      setQuestions([]);
      setQuestionIndex(0);
      setScore(0);
      setStreak(0);
      setBetAmount(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setIsAnswering(false);
    } catch (err) {
      console.error("Erro ao finalizar jogo:", err);
    }
  }, [currentMatch, user, score, questions, betAmount, toast, questionIndex, completeGame]);

  const currentQuestion = questions[questionIndex] || null;

  return {
    categories,
    currentMatch,
    currentQuestion,
    questionIndex,
    totalQuestions: questions.length,
    score,
    isLoading,
    isAnswering,
    selectedAnswer,
    isCorrect,
    timeLeft,
    streak,
    betAmount,
    setBetAmount,
    startGame,
    answerQuestion,
    nextQuestion,
    endGame,
    fetchCategories,
  };
}
