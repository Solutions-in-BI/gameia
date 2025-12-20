# 🎮 Game Zone - Documentação para Aprendizado

## Visão Geral do Projeto

Este projeto é uma coleção de jogos arcade desenvolvida em React + TypeScript, projetada para servir como **material de estudo** sobre desenvolvimento de jogos web modernos.

---

## 📁 Estrutura de Pastas

```
src/
├── components/           # Componentes React (UI)
│   ├── game/            # Componentes específicos dos jogos
│   │   ├── common/      # Componentes reutilizáveis entre jogos
│   │   ├── memory/      # Componentes do Jogo da Memória
│   │   ├── snake/       # Componentes do Snake
│   │   ├── dino/        # Componentes do Dino Runner
│   │   ├── menu/        # Menu principal
│   │   └── profile/     # Página de perfil/conquistas
│   └── ui/              # Componentes genéricos (shadcn/ui)
│
├── hooks/               # Custom Hooks (lógica reutilizável)
│   ├── useSnakeGame.ts  # Lógica completa do Snake
│   ├── useMemoryGame.ts # Lógica do Jogo da Memória
│   ├── useDinoGame.ts   # Lógica do Dino Runner
│   ├── useAchievements.ts # Sistema de conquistas
│   ├── useLeaderboard.ts  # Ranking online
│   ├── useAuth.ts       # Autenticação
│   ├── useLocalStorage.ts # Persistência local
│   ├── useGameLoop.ts   # Game loop genérico
│   └── useTimer.ts      # Cronômetro
│
├── types/               # Definições TypeScript
│   ├── game.ts          # Tipos dos jogos
│   ├── achievements.ts  # Tipos de conquistas
│   └── leaderboard.ts   # Tipos do ranking
│
├── constants/           # Configurações e constantes
│   ├── game.ts          # Configurações dos jogos
│   ├── dino.ts          # Configurações específicas do Dino
│   └── achievements.ts  # Lista de conquistas
│
├── utils/               # Funções utilitárias puras
│   ├── array.ts         # Manipulação de arrays
│   └── time.ts          # Formatação de tempo
│
├── pages/               # Páginas da aplicação
│   ├── Index.tsx        # Página principal
│   └── Auth.tsx         # Login/Cadastro
│
└── integrations/        # Integrações externas
    └── supabase/        # Cliente do banco de dados
```

---

## 🧩 Conceitos Principais

### 1. Separação de Responsabilidades

O projeto segue o princípio de **separar lógica de UI**:

```
┌─────────────────┐     ┌─────────────────┐
│   COMPONENTES   │ ←── │     HOOKS       │
│   (Como mostra) │     │   (O que faz)   │
└─────────────────┘     └─────────────────┘
         ↑                      ↑
         │                      │
┌─────────────────┐     ┌─────────────────┐
│    CONSTANTES   │     │     TIPOS       │
│ (Configurações) │     │  (Estruturas)   │
└─────────────────┘     └─────────────────┘
```

**Por que isso é bom?**
- Hooks podem ser testados sem UI
- Componentes ficam simples (só renderizam)
- Fácil trocar a UI sem mexer na lógica
- Código mais organizado e manutenível

### 2. Custom Hooks

Hooks são funções que encapsulam lógica reutilizável. Exemplo simplificado:

```typescript
// Ruim: Lógica misturada com componente
function SnakeGame() {
  const [snake, setSnake] = useState([{x: 10, y: 10}]);
  const [food, setFood] = useState({x: 5, y: 5});
  // + 200 linhas de lógica aqui...
  
  return <div>...</div>;
}

// Bom: Lógica separada em hook
function SnakeGame() {
  const { snake, food, direction, startGame } = useSnakeGame();
  
  return <div>...</div>; // Só renderiza
}
```

### 3. Tipos TypeScript

Tipos garantem que você não cometa erros bobos:

```typescript
// Sem tipos: Erro só aparece quando roda
function moveSnake(direction) {
  // direction pode ser qualquer coisa!
}

// Com tipos: Erro aparece enquanto escreve
function moveSnake(direction: "UP" | "DOWN" | "LEFT" | "RIGHT") {
  // TypeScript não deixa passar "CIMA" ou 123
}
```

---

## 🎮 Como Cada Jogo Funciona

### Snake (Cobra)

**Arquivos principais:**
- `hooks/useSnakeGame.ts` - Toda a lógica
- `components/game/snake/SnakeGame.tsx` - UI principal
- `components/game/snake/SnakeBoard.tsx` - Renderiza o grid

**Fluxo do jogo:**
```
1. Usuário pressiona tecla → useKeyboardControls captura
2. Direção é atualizada → changeDirection()
3. Game loop tick → moveSnake() calcula nova posição
4. Colisão detectada? → endGame() ou continua
5. Comeu comida? → Cresce cobra, gera nova comida
6. Estado atualiza → React re-renderiza
```

**Conceitos importantes:**
- **Game Loop**: Função que roda ~60x por segundo
- **requestAnimationFrame**: API do browser para animações suaves
- **Ref vs State**: Refs não causam re-render (útil para direção atual)

### Jogo da Memória

**Arquivos principais:**
- `hooks/useMemoryGame.ts` - Lógica de virar cartas
- `components/game/memory/MemoryGame.tsx` - UI principal
- `components/game/memory/MemoryCard.tsx` - Carta individual

**Fluxo do jogo:**
```
1. initializeGame() → Embaralha cartas, cria pares
2. Clique em carta → handleCardClick()
3. Carta vira → isFlipped = true
4. Duas viradas? → Compara emojis
5. Par encontrado? → isMatched = true
6. Senão → Desvira após delay
7. Todas matched? → hasWon = true
```

### Dino Runner

**Arquivos principais:**
- `hooks/useDinoGame.ts` - Lógica de pulo e colisão
- `components/game/dino/DinoGame.tsx` - UI principal
- `components/game/dino/DinoCanvas.tsx` - Renderiza o jogo

**Conceitos de física:**
```typescript
// Simulação de gravidade simples
velocityRef.current += GRAVITY;  // Acelera para baixo
newY = prevY + velocityRef.current;  // Move

// Pulo: aplica força para cima
velocityRef.current = -JUMP_FORCE;  // Negativo = sobe
```

---

## 🔧 Hooks Utilitários

### useLocalStorage
Persiste dados entre sessões:
```typescript
const [valor, setValor] = useLocalStorage("chave", valorInicial);
// Funciona como useState, mas salva no localStorage
```

### useGameLoop
Executa função em intervalos regulares:
```typescript
useGameLoop({
  callback: moveSnake,  // Função a executar
  speed: 150,           // Intervalo em ms
  enabled: isPlaying,   // Só roda se true
});
```

### useTimer
Cronômetro com controles:
```typescript
const { time, start, stop, reset } = useTimer();
// time = segundos decorridos
```

---

## 🏆 Sistema de Conquistas

**Como funciona:**
1. Lista de conquistas definida em `constants/achievements.ts`
2. Cada conquista tem uma `condition` (condição para desbloquear)
3. `useAchievements.checkAndUnlock()` verifica após cada jogo
4. Conquistas desbloqueadas são salvas no localStorage

**Tipos de condição:**
- `games_played`: Jogar X vezes
- `score`: Atingir X pontos
- `moves`: Completar em X movimentos
- `time`: Completar em X segundos

---

## 🌐 Sistema de Ranking

**Arquitetura:**
```
┌──────────┐    ┌───────────────┐    ┌──────────────┐
│  React   │ ←→ │  useLeaderboard │ ←→ │  Supabase    │
│  (UI)    │    │    (Hook)     │    │  (Banco)     │
└──────────┘    └───────────────┘    └──────────────┘
```

**Recursos:**
- Atualização em tempo real (Realtime subscriptions)
- Upsert: atualiza score se melhor, senão ignora
- Posição do jogador mesmo fora do top 10

---

## 🔐 Autenticação

**Fluxo:**
1. Usuário cadastra com email + senha + apelido
2. Supabase cria conta + trigger cria perfil
3. Hook `useAuth` gerencia sessão
4. Scores são vinculados ao `user_id`

---

## 💡 Dicas para Replicar

1. **Comece simples**: Faça um Snake básico antes de adicionar conquistas
2. **Um hook por jogo**: Facilita entender e debugar
3. **Tipos primeiro**: Defina os tipos antes de codar
4. **Console.log generoso**: Adicione logs para entender o fluxo
5. **Componentes pequenos**: Divida em partes menores que fazem uma coisa

---

## 📚 Tecnologias Usadas

| Tecnologia | Para que serve |
|------------|----------------|
| React 18 | Biblioteca de UI |
| TypeScript | Tipagem estática |
| Vite | Build tool rápido |
| Tailwind CSS | Estilização com classes |
| shadcn/ui | Componentes base |
| Framer Motion | Animações |
| Supabase | Backend (banco + auth) |
| React Query | Cache de dados |

---

## 🚀 Próximos Passos para Estudar

1. Leia `useSnakeGame.ts` do início ao fim
2. Adicione um console.log em cada função
3. Jogue e observe o console
4. Tente adicionar um power-up ao Snake
5. Crie seu próprio mini-jogo usando a mesma estrutura
