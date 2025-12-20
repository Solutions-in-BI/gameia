import { useState, useCallback, useRef } from "react";
import { Position, Direction } from "@/types/game";
import {
  SNAKE_GRID_SIZE,
  SNAKE_INITIAL_SPEED,
  SNAKE_SPEED_INCREMENT,
  SNAKE_MIN_SPEED,
  SNAKE_POINTS_PER_FOOD,
  SNAKE_INITIAL_POSITION,
  SNAKE_INITIAL_DIRECTION,
  SNAKE_STORAGE_KEY,
} from "@/constants/game";
import { useLocalStorage } from "./useLocalStorage";
import { useGameLoop } from "./useGameLoop";
import { useKeyboardControls } from "./useKeyboardControls";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                           useSnakeGame                                     ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║ Hook que encapsula TODA a lógica do jogo Snake.                           ║
 * ║                                                                           ║
 * ║ RESPONSABILIDADES:                                                        ║
 * ║ - Gerenciar estado da cobra (posições, direção)                          ║
 * ║ - Gerenciar comida (posição, geração)                                    ║
 * ║ - Detectar colisões (parede, próprio corpo)                              ║
 * ║ - Controlar game loop (movimento contínuo)                               ║
 * ║ - Persistir recorde no localStorage                                      ║
 * ║                                                                           ║
 * ║ USO:                                                                      ║
 * ║ const { snake, food, score, startGame } = useSnakeGame();                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export function useSnakeGame() {
  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADO DO JOGO
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Array de posições representando a cobra.
   * O primeiro elemento (índice 0) é a CABEÇA.
   * Cada Position tem {x, y} indicando a célula no grid.
   * 
   * Exemplo: [{x:5,y:3}, {x:4,y:3}, {x:3,y:3}] = cobra horizontal de 3 células
   */
  const [snake, setSnake] = useState<Position[]>([SNAKE_INITIAL_POSITION]);
  
  /**
   * Posição da comida no grid.
   * Quando a cabeça da cobra atinge esta posição, ela cresce.
   */
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  
  /**
   * Direção atual do movimento.
   * Valores possíveis: "UP" | "DOWN" | "LEFT" | "RIGHT"
   */
  const [direction, setDirection] = useState<Direction>(SNAKE_INITIAL_DIRECTION);
  
  /** Indica se o jogo está rodando (game loop ativo) */
  const [isPlaying, setIsPlaying] = useState(false);
  
  /** Indica se o jogo terminou (colisão detectada) */
  const [isGameOver, setIsGameOver] = useState(false);
  
  /** Pontuação atual (10 pontos por comida) */
  const [score, setScore] = useState(0);
  
  /**
   * Velocidade atual (intervalo entre movimentos em ms).
   * Menor = mais rápido. Começa em 150ms, pode chegar a 50ms.
   */
  const [speed, setSpeed] = useState(SNAKE_INITIAL_SPEED);

  // ═══════════════════════════════════════════════════════════════════════════
  // REFS (valores que não causam re-render)
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * POR QUE USAR REF PARA DIREÇÃO?
   * 
   * O game loop (moveSnake) é chamado via setInterval/requestAnimationFrame.
   * Se usássemos o state 'direction' diretamente, ele seria "capturado" 
   * no momento em que o callback foi criado (closure).
   * 
   * Com ref, sempre pegamos o valor MAIS RECENTE, mesmo dentro do callback.
   * 
   * Resumo:
   * - State: React sabe quando mudou → re-renderiza
   * - Ref: Valor mutável → não re-renderiza → útil para game loops
   */
  const directionRef = useRef<Direction>(SNAKE_INITIAL_DIRECTION);

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSISTÊNCIA
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Recorde salvo no localStorage.
   * useLocalStorage funciona como useState, mas persiste entre sessões.
   */
  const [bestScore, setBestScore] = useLocalStorage(SNAKE_STORAGE_KEY, 0);

  // ═══════════════════════════════════════════════════════════════════════════
  // FUNÇÕES DO JOGO
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Gera nova posição de comida.
   * 
   * ALGORITMO:
   * 1. Gera posição aleatória dentro do grid
   * 2. Verifica se não está em cima da cobra
   * 3. Se estiver, gera outra posição
   * 4. Repete até achar posição válida
   * 
   * @param currentSnake - Posições atuais da cobra (para evitar)
   * @returns Nova posição {x, y} para a comida
   */
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * SNAKE_GRID_SIZE),
        y: Math.floor(Math.random() * SNAKE_GRID_SIZE),
      };
      // Continua gerando enquanto a comida estiver na cobra
    } while (currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
  }, []);

  /**
   * Reinicia o jogo para o estado inicial.
   * Chamada quando usuário clica em "Reiniciar".
   */
  const resetGame = useCallback(() => {
    const initialSnake = [SNAKE_INITIAL_POSITION];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection(SNAKE_INITIAL_DIRECTION);
    directionRef.current = SNAKE_INITIAL_DIRECTION;
    setScore(0);
    setSpeed(SNAKE_INITIAL_SPEED);
    setIsGameOver(false);
    setIsPlaying(false);
  }, [generateFood]);

  /**
   * Finaliza o jogo.
   * Chamada quando detecta colisão.
   */
  const endGame = useCallback(() => {
    setIsGameOver(true);
    setIsPlaying(false);
    
    // Atualiza recorde se necessário
    if (score > bestScore) {
      setBestScore(score);
    }
  }, [score, bestScore, setBestScore]);

  /**
   * Move a cobra um passo na direção atual.
   * 
   * Esta é a função MAIS IMPORTANTE do jogo!
   * É chamada a cada "tick" do game loop.
   * 
   * ALGORITMO:
   * 1. Calcula nova posição da cabeça baseado na direção
   * 2. Verifica colisão com paredes → Game Over
   * 3. Verifica colisão consigo mesma → Game Over
   * 4. Cria nova cobra com cabeça na frente
   * 5. Se comeu comida → Mantém cauda (cresce)
   * 6. Se não comeu → Remove cauda (move)
   */
  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      // Pega posição atual da cabeça
      const head = prevSnake[0];
      // Pega direção do REF (não do state!)
      const dir = directionRef.current;

      // Calcula nova posição da cabeça
      let newHead: Position;
      switch (dir) {
        case "UP":    newHead = { x: head.x, y: head.y - 1 }; break;
        case "DOWN":  newHead = { x: head.x, y: head.y + 1 }; break;
        case "LEFT":  newHead = { x: head.x - 1, y: head.y }; break;
        case "RIGHT": newHead = { x: head.x + 1, y: head.y }; break;
      }

      // ═══ DETECÇÃO DE COLISÃO COM PAREDE ═══
      if (
        newHead.x < 0 || 
        newHead.x >= SNAKE_GRID_SIZE || 
        newHead.y < 0 || 
        newHead.y >= SNAKE_GRID_SIZE
      ) {
        // setTimeout evita chamar setState durante render
        setTimeout(endGame, 0);
        return prevSnake; // Retorna cobra sem modificar
      }

      // ═══ DETECÇÃO DE COLISÃO CONSIGO MESMA ═══
      if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        setTimeout(endGame, 0);
        return prevSnake;
      }

      // ═══ MOVIMENTO: Nova cobra com cabeça na frente ═══
      const newSnake = [newHead, ...prevSnake];

      // ═══ VERIFICAR SE COMEU ═══
      if (newHead.x === food.x && newHead.y === food.y) {
        // Comeu! Ganha pontos, gera nova comida, acelera
        setScore(s => s + SNAKE_POINTS_PER_FOOD);
        setFood(generateFood(newSnake));
        setSpeed(s => Math.max(SNAKE_MIN_SPEED, s - SNAKE_SPEED_INCREMENT));
        return newSnake; // NÃO remove cauda = cobra cresce
      }

      // Não comeu: remove a cauda (cobra se move sem crescer)
      newSnake.pop();
      return newSnake;
    });
  }, [food, generateFood, endGame]);

  /**
   * Atualiza a direção do movimento.
   * Atualiza tanto o state (para UI) quanto a ref (para game loop).
   */
  const changeDirection = useCallback((newDirection: Direction) => {
    directionRef.current = newDirection;
    setDirection(newDirection);
  }, []);

  /**
   * Inicia o jogo (ativa o game loop).
   */
  const startGame = useCallback(() => {
    if (!isPlaying && !isGameOver) {
      setIsPlaying(true);
    }
  }, [isPlaying, isGameOver]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HOOKS AUXILIARES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Game Loop - Executa moveSnake() em intervalos regulares.
   * 
   * O hook useGameLoop usa requestAnimationFrame internamente,
   * que é mais eficiente que setInterval para animações.
   */
  useGameLoop({
    callback: moveSnake,
    speed,  // Intervalo entre execuções (ms)
    enabled: isPlaying && !isGameOver,  // Só roda se jogando
  });

  /**
   * Controles de teclado - Captura teclas de direção.
   * 
   * Suporta: Setas e WASD
   * Também inicia o jogo ao pressionar qualquer tecla de direção.
   */
  useKeyboardControls({
    currentDirection: direction,
    onDirectionChange: changeDirection,
    onStart: startGame,
    enabled: !isGameOver,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // RETORNO DO HOOK
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * O hook retorna TUDO que o componente precisa:
   * - Estado: dados para renderizar
   * - Ações: funções para interagir
   * 
   * O componente só precisa usar, não precisa saber como funciona.
   */
  return {
    // ═══ ESTADO (para renderizar) ═══
    snake,
    food,
    direction,
    isPlaying,
    isGameOver,
    score,
    bestScore,
    gridSize: SNAKE_GRID_SIZE,
    
    // ═══ AÇÕES (para interagir) ═══
    changeDirection,
    startGame,
    resetGame,
  };
}
