-- =====================================================
-- SEED DATA: TESTES COGNITIVOS ENTERPRISE
-- Usando apenas os question_types permitidos
-- =====================================================

DO $$
DECLARE
    org_id UUID := 'a5a8c495-f261-426b-bbc2-40c20a7d70af';
    test_logic_id UUID;
    test_verbal_id UUID;
    test_spatial_id UUID;
    test_attention_id UUID;
    test_memory_id UUID;
    test_numerical_id UUID;
BEGIN

-- Limpar testes anteriores se existirem
DELETE FROM cognitive_test_questions WHERE test_id IN (SELECT id FROM cognitive_tests WHERE organization_id = org_id);
DELETE FROM cognitive_tests WHERE organization_id = org_id;

-- =====================================================
-- TESTES COGNITIVOS
-- =====================================================

INSERT INTO cognitive_tests (organization_id, name, description, test_type, difficulty, time_limit_minutes, questions_count, xp_reward, is_active)
VALUES (org_id, 'Raciocínio Lógico', 'Identifique padrões em sequências e resolva problemas lógicos', 'logic', 'medium', 20, 15, 200, true)
RETURNING id INTO test_logic_id;

INSERT INTO cognitive_tests (organization_id, name, description, test_type, difficulty, time_limit_minutes, questions_count, xp_reward, is_active)
VALUES (org_id, 'Raciocínio Verbal', 'Analogias e relações entre palavras e conceitos', 'verbal', 'medium', 25, 15, 175, true)
RETURNING id INTO test_verbal_id;

INSERT INTO cognitive_tests (organization_id, name, description, test_type, difficulty, time_limit_minutes, questions_count, xp_reward, is_active)
VALUES (org_id, 'Raciocínio Espacial', 'Rotação mental e visualização de formas 3D', 'spatial', 'hard', 30, 12, 250, true)
RETURNING id INTO test_spatial_id;

INSERT INTO cognitive_tests (organization_id, name, description, test_type, difficulty, time_limit_minutes, questions_count, xp_reward, is_active)
VALUES (org_id, 'Atenção Concentrada', 'Teste de atenção sustentada e percepção de detalhes', 'attention', 'easy', 15, 20, 150, true)
RETURNING id INTO test_attention_id;

INSERT INTO cognitive_tests (organization_id, name, description, test_type, difficulty, time_limit_minutes, questions_count, xp_reward, is_active)
VALUES (org_id, 'Memória de Trabalho', 'Retenção e manipulação de informações de curto prazo', 'memory', 'medium', 15, 15, 175, true)
RETURNING id INTO test_memory_id;

INSERT INTO cognitive_tests (organization_id, name, description, test_type, difficulty, time_limit_minutes, questions_count, xp_reward, is_active)
VALUES (org_id, 'Cálculo Mental', 'Operações matemáticas e raciocínio numérico', 'numerical', 'hard', 20, 15, 225, true)
RETURNING id INTO test_numerical_id;

-- =====================================================
-- QUESTÕES: RACIOCÍNIO LÓGICO (15 questões)
-- Usando: sequence, pattern, syllogism
-- =====================================================

INSERT INTO cognitive_test_questions (test_id, question_type, content, correct_answer, difficulty, sort_order) VALUES
(test_logic_id, 'sequence', '{"question": "Qual o próximo número? 2, 4, 8, 16, ?", "options": ["24", "32", "30", "28"], "explanation": "Cada número é multiplicado por 2"}', '32', 1, 1),
(test_logic_id, 'sequence', '{"question": "Complete a sequência: 1, 1, 2, 3, 5, 8, ?", "options": ["11", "12", "13", "15"], "explanation": "Sequência de Fibonacci"}', '13', 2, 2),
(test_logic_id, 'sequence', '{"question": "Qual número falta? 3, 6, 11, 18, ?, 38", "options": ["25", "27", "29", "26"], "explanation": "Diferenças: +3, +5, +7, +9, +11"}', '27', 2, 3),
(test_logic_id, 'sequence', '{"question": "Complete: 100, 95, 85, 70, ?", "options": ["50", "55", "60", "45"], "explanation": "Diferenças: -5, -10, -15, -20"}', '50', 2, 4),
(test_logic_id, 'pattern', '{"question": "Se A=1, B=2, C=3, quanto vale a palavra CAB?", "options": ["6", "5", "7", "8"], "explanation": "C(3) + A(1) + B(2) = 6"}', '6', 1, 5),
(test_logic_id, 'pattern', '{"question": "Qual letra vem depois? A, C, F, J, ?", "options": ["N", "O", "M", "P"], "explanation": "Diferenças: +2, +3, +4, +5 posições"}', 'O', 2, 6),
(test_logic_id, 'syllogism', '{"question": "Se todos os Blips são Blops, e alguns Blops são Blups, então:", "options": ["Todos Blips são Blups", "Alguns Blips podem ser Blups", "Nenhum Blip é Blup", "Todos Blops são Blips"], "explanation": "Lógica de conjuntos"}', 'Alguns Blips podem ser Blups', 3, 7),
(test_logic_id, 'syllogism', '{"question": "Ana é mais alta que Bia. Carla é mais baixa que Bia. Quem é mais alta?", "options": ["Bia", "Carla", "Ana", "Impossível saber"], "explanation": "Ana > Bia > Carla"}', 'Ana', 1, 8),
(test_logic_id, 'sequence', '{"question": "2, 6, 12, 20, 30, ?", "options": ["40", "42", "44", "46"], "explanation": "Diferenças: +4, +6, +8, +10, +12"}', '42', 2, 9),
(test_logic_id, 'pattern', '{"question": "Qual é o padrão? 1, 4, 9, 16, 25, ?", "options": ["30", "35", "36", "49"], "explanation": "Quadrados perfeitos"}', '36', 2, 10),
(test_logic_id, 'syllogism', '{"question": "Se chove, a rua fica molhada. A rua está molhada. Podemos afirmar:", "options": ["Choveu", "Não choveu", "Pode ou não ter chovido", "A rua sempre está molhada"], "explanation": "Falácia do consequente"}', 'Pode ou não ter chovido', 3, 11),
(test_logic_id, 'sequence', '{"question": "1, 2, 4, 7, 11, 16, ?", "options": ["21", "22", "23", "24"], "explanation": "Diferenças: +1, +2, +3, +4, +5, +6"}', '22', 2, 12),
(test_logic_id, 'pattern', '{"question": "Se MESA = 46 e CASA = 27, quanto vale SALA?", "options": ["37", "38", "36", "39"], "explanation": "Soma das posições das letras"}', '37', 3, 13),
(test_logic_id, 'syllogism', '{"question": "Pedro está entre João e Maria. João está à esquerda. Quem está no meio?", "options": ["João", "Maria", "Pedro", "Impossível saber"], "explanation": "João - Pedro - Maria"}', 'Pedro', 1, 14),
(test_logic_id, 'sequence', '{"question": "81, 27, 9, 3, ?", "options": ["0", "1", "2", "3"], "explanation": "Dividido por 3"}', '1', 1, 15);

-- =====================================================
-- QUESTÕES: RACIOCÍNIO VERBAL (15 questões)
-- Usando: analogy, pattern
-- =====================================================

INSERT INTO cognitive_test_questions (test_id, question_type, content, correct_answer, difficulty, sort_order) VALUES
(test_verbal_id, 'analogy', '{"question": "Livro está para Biblioteca assim como Quadro está para:", "options": ["Pintor", "Museu", "Arte", "Parede"], "explanation": "Relação de local"}', 'Museu', 1, 1),
(test_verbal_id, 'analogy', '{"question": "Médico está para Hospital assim como Professor está para:", "options": ["Aluno", "Livro", "Escola", "Educação"], "explanation": "Profissional-local"}', 'Escola', 1, 2),
(test_verbal_id, 'pattern', '{"question": "Qual palavra é sinônimo de EFÊMERO?", "options": ["Eterno", "Passageiro", "Importante", "Rápido"], "explanation": "Efêmero = passageiro"}', 'Passageiro', 2, 3),
(test_verbal_id, 'pattern', '{"question": "Qual é o antônimo de PROLIXO?", "options": ["Extenso", "Conciso", "Detalhado", "Verboso"], "explanation": "Prolixo vs Conciso"}', 'Conciso', 2, 4),
(test_verbal_id, 'analogy', '{"question": "Água está para Sede assim como Comida está para:", "options": ["Fome", "Boca", "Cozinha", "Prato"], "explanation": "Necessidade satisfeita"}', 'Fome', 1, 5),
(test_verbal_id, 'pattern', '{"question": "Qual palavra é sinônimo de UBÍQUO?", "options": ["Raro", "Onipresente", "Único", "Distante"], "explanation": "Ubíquo = onipresente"}', 'Onipresente', 3, 6),
(test_verbal_id, 'analogy', '{"question": "Olho está para Ver assim como Ouvido está para:", "options": ["Som", "Escutar", "Música", "Barulho"], "explanation": "Órgão-função"}', 'Escutar', 1, 7),
(test_verbal_id, 'pattern', '{"question": "Qual é o antônimo de ADVERSIDADE?", "options": ["Dificuldade", "Oposição", "Prosperidade", "Problema"], "explanation": "Adversidade vs Prosperidade"}', 'Prosperidade', 2, 8),
(test_verbal_id, 'analogy', '{"question": "Pássaro está para Ninho assim como Abelha está para:", "options": ["Mel", "Flor", "Colmeia", "Voar"], "explanation": "Animal-moradia"}', 'Colmeia', 1, 9),
(test_verbal_id, 'pattern', '{"question": "Qual palavra é sinônimo de PERSPICAZ?", "options": ["Lento", "Astuto", "Confuso", "Simples"], "explanation": "Perspicaz = astuto"}', 'Astuto', 2, 10),
(test_verbal_id, 'analogy', '{"question": "Pincel está para Pintor assim como Bisturi está para:", "options": ["Hospital", "Cirurgião", "Operação", "Sangue"], "explanation": "Ferramenta-profissional"}', 'Cirurgião', 1, 11),
(test_verbal_id, 'pattern', '{"question": "Qual é o antônimo de ALTRUÍSTA?", "options": ["Generoso", "Egoísta", "Bondoso", "Caridoso"], "explanation": "Altruísta vs Egoísta"}', 'Egoísta', 2, 12),
(test_verbal_id, 'analogy', '{"question": "Árvore está para Floresta assim como Estrela está para:", "options": ["Lua", "Céu", "Galáxia", "Noite"], "explanation": "Unidade-conjunto"}', 'Galáxia', 2, 13),
(test_verbal_id, 'pattern', '{"question": "Qual palavra é sinônimo de LACÔNICO?", "options": ["Extenso", "Breve", "Complexo", "Detalhado"], "explanation": "Lacônico = breve"}', 'Breve', 3, 14),
(test_verbal_id, 'analogy', '{"question": "Semente está para Árvore assim como Ovo está para:", "options": ["Galinha", "Ninho", "Ave", "Casca"], "explanation": "Origem-resultado"}', 'Ave', 2, 15);

-- =====================================================
-- QUESTÕES: RACIOCÍNIO ESPACIAL (12 questões)
-- Usando: pattern, sequence
-- =====================================================

INSERT INTO cognitive_test_questions (test_id, question_type, content, correct_answer, difficulty, sort_order) VALUES
(test_spatial_id, 'pattern', '{"question": "Se você girar a letra L 90° para a direita, qual será o resultado?", "options": ["⌐", "⌙", "Γ", "⌐"], "explanation": "Rotação horária"}', '⌐', 2, 1),
(test_spatial_id, 'word_problem', '{"question": "Um papel dobrado ao meio e cortado no canto. Quantos furos ao abrir?", "options": ["1", "2", "4", "8"], "explanation": "Uma dobra duplica"}', '2', 2, 2),
(test_spatial_id, 'pattern', '{"question": "Quantas faces tem um cubo?", "options": ["4", "6", "8", "12"], "explanation": "Cubo = 6 faces"}', '6', 1, 3),
(test_spatial_id, 'word_problem', '{"question": "Cubo pintado cortado em 27 menores. Quantos têm 2 faces pintadas?", "options": ["8", "12", "6", "1"], "explanation": "Arestas = 12"}', '12', 3, 4),
(test_spatial_id, 'pattern', '{"question": "Seta para cima virada de cabeça para baixo aponta para:", "options": ["Cima", "Baixo", "Esquerda", "Direita"], "explanation": "Rotação 180°"}', 'Baixo', 1, 5),
(test_spatial_id, 'word_problem', '{"question": "Papel dobrado 3x com 1 furo. Quantos furos ao abrir?", "options": ["3", "6", "8", "4"], "explanation": "2³ = 8 furos"}', '8', 3, 6),
(test_spatial_id, 'pattern', '{"question": "Qual é a imagem espelhada de AMOR?", "options": ["ROMA", "AMOR", "RAMO", "MORA"], "explanation": "Espelho horizontal"}', 'ROMA', 2, 7),
(test_spatial_id, 'pattern', '{"question": "Quantas arestas tem um cubo?", "options": ["6", "8", "12", "10"], "explanation": "Cubo = 12 arestas"}', '12', 1, 8),
(test_spatial_id, 'pattern', '{"question": "Letra N girada 180°, o que você vê?", "options": ["N", "Z", "U", "M"], "explanation": "N rotacionado = N"}', 'N', 2, 9),
(test_spatial_id, 'sequence', '{"question": "Complete o padrão: ○ △ □ ○ △ ?", "options": ["○", "△", "□", "◇"], "explanation": "Sequência repetida"}', '□', 1, 10),
(test_spatial_id, 'word_problem', '{"question": "Cubo pintado cortado em 8. Quantos têm 3 faces pintadas?", "options": ["0", "4", "8", "6"], "explanation": "Todos os 8 cantos"}', '8', 2, 11),
(test_spatial_id, 'pattern', '{"question": "Dobrando um quadrado na diagonal, que forma obtém?", "options": ["Retângulo", "Triângulo", "Trapézio", "Losango"], "explanation": "Diagonal = triângulo"}', 'Triângulo', 1, 12);

-- =====================================================
-- QUESTÕES: ATENÇÃO (20 questões)
-- Usando: pattern, sequence
-- =====================================================

INSERT INTO cognitive_test_questions (test_id, question_type, content, correct_answer, difficulty, sort_order) VALUES
(test_attention_id, 'pattern', '{"question": "Quantas letras A existem? ABRACADABRA", "options": ["4", "5", "6", "3"], "explanation": "5 letras A"}', '5', 1, 1),
(test_attention_id, 'pattern', '{"question": "Qual número é diferente? 6 9 6 6 6 9 6 8 6", "options": ["9", "8", "6", "Todos iguais"], "explanation": "8 aparece uma vez"}', '8', 1, 2),
(test_attention_id, 'pattern', '{"question": "Quantos números pares? 3, 7, 2, 8, 5, 4, 9, 6, 1", "options": ["3", "4", "5", "2"], "explanation": "2, 8, 4, 6 = 4"}', '4', 1, 3),
(test_attention_id, 'sequence', '{"question": "Encontre o erro: 2, 4, 6, 8, 9, 12, 14", "options": ["8", "9", "12", "14"], "explanation": "9 não é par"}', '9', 1, 4),
(test_attention_id, 'pattern', '{"question": "Quantas vezes 7 aparece? 7177717771777", "options": ["8", "9", "10", "11"], "explanation": "Conte cada 7"}', '10', 2, 5),
(test_attention_id, 'pattern', '{"question": "Qual é diferente? OOOOOOO0OOOOO", "options": ["Primeira", "Oitava", "Última", "Todas iguais"], "explanation": "Oitava é número 0"}', 'Oitava', 2, 6),
(test_attention_id, 'pattern', '{"question": "Quantos triângulos? △△○△□△○△△□△", "options": ["6", "7", "8", "5"], "explanation": "7 triângulos"}', '7', 1, 7),
(test_attention_id, 'sequence', '{"question": "Qual vem a seguir? AABABCABCD?", "options": ["A", "E", "ABCDE", "D"], "explanation": "Padrão crescente"}', 'ABCDE', 2, 8),
(test_attention_id, 'pattern', '{"question": "Qual não pertence? cachorro, gato, leão, cadeira, elefante", "options": ["Cachorro", "Leão", "Cadeira", "Elefante"], "explanation": "Cadeira não é animal"}', 'Cadeira', 1, 9),
(test_attention_id, 'pattern', '{"question": "Quantas palavras têm 4 letras? mesa, casa, sol, amor, paz, vida", "options": ["2", "3", "4", "5"], "explanation": "mesa, casa, amor, vida = 4"}', '4', 1, 10),
(test_attention_id, 'sequence', '{"question": "Complete: B2C3D4E?", "options": ["5", "F", "6", "5F"], "explanation": "Padrão letra-número"}', '5', 2, 11),
(test_attention_id, 'pattern', '{"question": "Qual é diferente? 12, 21, 13, 31, 14, 24, 15, 51", "options": ["21", "24", "31", "51"], "explanation": "24 não inverte"}', '24', 2, 12),
(test_attention_id, 'pattern', '{"question": "Quantas vogais? PARALELEPIPEDO", "options": ["5", "6", "7", "8"], "explanation": "7 vogais"}', '7', 2, 13),
(test_attention_id, 'sequence', '{"question": "O que falta? Segunda, Terça, ?, Quinta", "options": ["Quarta", "Sexta", "Domingo", "Sábado"], "explanation": "Dias da semana"}', 'Quarta', 1, 14),
(test_attention_id, 'pattern', '{"question": "Qual grupo é diferente? AB, CD, EF, GI, HI", "options": ["AB", "EF", "GI", "HI"], "explanation": "GI pula H"}', 'GI', 2, 15),
(test_attention_id, 'pattern', '{"question": "Quantos quadrados brancos? □■□□■■□■□□■", "options": ["5", "6", "7", "8"], "explanation": "6 brancos"}', '6', 1, 16),
(test_attention_id, 'sequence', '{"question": "Erro: Janeiro, Fevereiro, Março, Maio, Abril", "options": ["Março", "Maio", "Abril", "Não há erro"], "explanation": "Maio/Abril invertidos"}', 'Maio', 1, 17),
(test_attention_id, 'pattern', '{"question": "Qual não pertence? 2, 4, 6, 8, 11, 12, 14", "options": ["4", "8", "11", "14"], "explanation": "11 é ímpar"}', '11', 1, 18),
(test_attention_id, 'pattern', '{"question": "Quantas letras diferentes em BANANA?", "options": ["2", "3", "4", "6"], "explanation": "B, A, N = 3"}', '3', 1, 19),
(test_attention_id, 'sequence', '{"question": "Complete: Z, X, V, T, ?", "options": ["S", "R", "U", "Q"], "explanation": "Pula uma letra"}', 'R', 2, 20);

-- =====================================================
-- QUESTÕES: MEMÓRIA (15 questões)
-- Usando: sequence, pattern
-- =====================================================

INSERT INTO cognitive_test_questions (test_id, question_type, content, correct_answer, difficulty, sort_order) VALUES
(test_memory_id, 'sequence', '{"question": "Memorize e inverta: 4-7-2", "options": ["2-7-4", "4-2-7", "7-4-2", "2-4-7"], "explanation": "Invertido: 2-7-4"}', '2-7-4', 1, 1),
(test_memory_id, 'calculation', '{"question": "Lembre: 5, 8, 3. Some o primeiro com o último:", "options": ["13", "8", "11", "6"], "explanation": "5 + 3 = 8"}', '8', 1, 2),
(test_memory_id, 'sequence', '{"question": "Memorize e inverta: 9-3-7-1", "options": ["1-7-3-9", "9-7-3-1", "3-7-1-9", "1-3-7-9"], "explanation": "Invertido: 1-7-3-9"}', '1-7-3-9', 2, 3),
(test_memory_id, 'calculation', '{"question": "Lembre: 12, 5, 8, 3. Soma dos dois do meio?", "options": ["13", "15", "17", "8"], "explanation": "5 + 8 = 13"}', '13', 2, 4),
(test_memory_id, 'pattern', '{"question": "Memorize: Azul, Vermelho, Verde. Qual era a segunda?", "options": ["Azul", "Vermelho", "Verde", "Amarelo"], "explanation": "Segunda: Vermelho"}', 'Vermelho', 1, 5),
(test_memory_id, 'sequence', '{"question": "Memorize e inverta: 2-5-8-4-1", "options": ["1-4-8-5-2", "2-4-8-5-1", "1-5-8-4-2", "8-5-4-2-1"], "explanation": "Invertido: 1-4-8-5-2"}', '1-4-8-5-2', 3, 6),
(test_memory_id, 'calculation', '{"question": "Lembre: 7, 4, 9, 2. Maior × menor:", "options": ["18", "28", "14", "8"], "explanation": "9 × 2 = 18"}', '18', 2, 7),
(test_memory_id, 'pattern', '{"question": "Memorize: Casa, Carro, Livro, Mesa. Qual foi o terceiro?", "options": ["Casa", "Carro", "Livro", "Mesa"], "explanation": "Terceiro: Livro"}', 'Livro', 1, 8),
(test_memory_id, 'calculation', '{"question": "Lembre: 15, 8, 12, 5. Maior - menor:", "options": ["7", "10", "3", "12"], "explanation": "15 - 5 = 10"}', '10', 2, 9),
(test_memory_id, 'sequence', '{"question": "Memorize e inverta: Gato-Casa-Sol", "options": ["Sol-Casa-Gato", "Gato-Sol-Casa", "Casa-Sol-Gato", "Sol-Gato-Casa"], "explanation": "Invertido"}', 'Sol-Casa-Gato', 2, 10),
(test_memory_id, 'pattern', '{"question": "Memorize: 3, 7, 2, 9, 4. Quais maiores que 5?", "options": ["7, 9", "3, 7, 9", "7, 9, 4", "2, 9"], "explanation": "7 e 9 > 5"}', '7, 9', 2, 11),
(test_memory_id, 'calculation', '{"question": "Lembre: A=3, B=5, C=2. Quanto vale A+B-C?", "options": ["6", "8", "10", "4"], "explanation": "3+5-2 = 6"}', '6', 2, 12),
(test_memory_id, 'sequence', '{"question": "Memorize e inverta: 6-2-9-4-7-1", "options": ["1-7-4-9-2-6", "6-7-4-9-2-1", "1-2-4-9-7-6", "7-4-9-2-6-1"], "explanation": "Invertido"}', '1-7-4-9-2-6', 3, 13),
(test_memory_id, 'pattern', '{"question": "Segunda, Quarta, Sexta, Domingo. Qual NÃO foi mencionado?", "options": ["Terça", "Quarta", "Sábado", "Terça e Sábado"], "explanation": "Terça e Sábado"}', 'Terça e Sábado', 2, 14),
(test_memory_id, 'calculation', '{"question": "Lembre: 4, 8, 2, 6. Some todos e divida por 2:", "options": ["10", "12", "8", "20"], "explanation": "20 ÷ 2 = 10"}', '10', 3, 15);

-- =====================================================
-- QUESTÕES: CÁLCULO MENTAL (15 questões)
-- Usando: calculation, word_problem
-- =====================================================

INSERT INTO cognitive_test_questions (test_id, question_type, content, correct_answer, difficulty, sort_order) VALUES
(test_numerical_id, 'calculation', '{"question": "Calcule: 47 + 38", "options": ["75", "85", "95", "84"], "explanation": "47 + 38 = 85"}', '85', 1, 1),
(test_numerical_id, 'calculation', '{"question": "Calcule: 125 - 67", "options": ["58", "68", "48", "78"], "explanation": "125 - 67 = 58"}', '58', 2, 2),
(test_numerical_id, 'calculation', '{"question": "Calcule: 12 × 15", "options": ["170", "180", "175", "185"], "explanation": "12 × 15 = 180"}', '180', 2, 3),
(test_numerical_id, 'calculation', '{"question": "Calcule: 144 ÷ 12", "options": ["11", "12", "13", "14"], "explanation": "144 ÷ 12 = 12"}', '12', 1, 4),
(test_numerical_id, 'word_problem', '{"question": "Quanto é 25% de 200?", "options": ["40", "50", "60", "25"], "explanation": "25% de 200 = 50"}', '50', 1, 5),
(test_numerical_id, 'calculation', '{"question": "Calcule: 1000 - 463", "options": ["537", "547", "527", "637"], "explanation": "1000 - 463 = 537"}', '537', 2, 6),
(test_numerical_id, 'calculation', '{"question": "Calcule: 25 × 24", "options": ["500", "600", "550", "650"], "explanation": "25 × 24 = 600"}', '600', 3, 7),
(test_numerical_id, 'word_problem', '{"question": "Produto R$80 com 15% desconto. Valor final?", "options": ["R$65", "R$68", "R$70", "R$72"], "explanation": "80 - 12 = 68"}', 'R$68', 2, 8),
(test_numerical_id, 'calculation', '{"question": "Calcule: 225 ÷ 15", "options": ["13", "14", "15", "16"], "explanation": "225 ÷ 15 = 15"}', '15', 2, 9),
(test_numerical_id, 'calculation', '{"question": "Calcule: 456 + 789", "options": ["1235", "1245", "1255", "1345"], "explanation": "456 + 789 = 1245"}', '1245', 2, 10),
(test_numerical_id, 'word_problem', '{"question": "50 para 65. Qual aumento %?", "options": ["25%", "30%", "35%", "15%"], "explanation": "(65-50)/50 = 30%"}', '30%', 3, 11),
(test_numerical_id, 'calculation', '{"question": "Quanto é 3/4 + 1/2?", "options": ["5/4", "4/6", "1", "5/6"], "explanation": "3/4 + 2/4 = 5/4"}', '5/4', 2, 12),
(test_numerical_id, 'calculation', '{"question": "Calcule: 18 × 18", "options": ["314", "324", "334", "344"], "explanation": "18 × 18 = 324"}', '324', 3, 13),
(test_numerical_id, 'calculation', '{"question": "Calcule: 2.5 + 3.75 + 1.25", "options": ["7.5", "7.25", "8", "6.5"], "explanation": "= 7.5"}', '7.5', 2, 14),
(test_numerical_id, 'word_problem', '{"question": "Se 40% de X é 60, qual é X?", "options": ["100", "120", "150", "180"], "explanation": "X = 150"}', '150', 3, 15);

END $$;

-- =====================================================
-- TEMPLATES DE ONE-ON-ONE
-- =====================================================

INSERT INTO one_on_one_templates (organization_id, name, questions, is_default)
SELECT 
  'a5a8c495-f261-426b-bbc2-40c20a7d70af',
  'Check-in Semanal',
  '[
    {"section": "wins", "questions": ["Quais foram suas maiores conquistas esta semana?", "O que te deixou orgulhoso do seu trabalho?"]},
    {"section": "challenges", "questions": ["Quais obstáculos você enfrentou?", "Precisa de ajuda ou recursos adicionais?"]},
    {"section": "goals", "questions": ["Como está o progresso das suas metas?", "Precisa ajustar prazos ou prioridades?"]},
    {"section": "feedback", "questions": ["Como posso te apoiar melhor?", "Algum feedback para mim ou para a equipe?"]}
  ]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM one_on_one_templates WHERE name = 'Check-in Semanal');

INSERT INTO one_on_one_templates (organization_id, name, questions, is_default)
SELECT 
  'a5a8c495-f261-426b-bbc2-40c20a7d70af',
  'Revisão de Carreira',
  '[
    {"section": "career", "questions": ["Onde você se vê em 1 ano?", "Quais habilidades gostaria de desenvolver?"]},
    {"section": "growth", "questions": ["Quais oportunidades de crescimento você identifica?", "Como posso ajudar no seu desenvolvimento?"]},
    {"section": "satisfaction", "questions": ["O que te motiva no trabalho atual?", "O que poderia ser melhor?"]},
    {"section": "action", "questions": ["Quais são os próximos passos para sua carreira?", "Que apoio você precisa?"]}
  ]'::jsonb,
  false
WHERE NOT EXISTS (SELECT 1 FROM one_on_one_templates WHERE name = 'Revisão de Carreira');

INSERT INTO one_on_one_templates (organization_id, name, questions, is_default)
SELECT 
  'a5a8c495-f261-426b-bbc2-40c20a7d70af',
  'Feedback de Projeto',
  '[
    {"section": "project", "questions": ["Como foi sua experiência no projeto?", "Quais foram os maiores aprendizados?"]},
    {"section": "team", "questions": ["Como foi a colaboração com a equipe?", "Houve algum conflito ou desafio interpessoal?"]},
    {"section": "process", "questions": ["O que funcionou bem?", "O que poderíamos melhorar?"]},
    {"section": "next", "questions": ["O que você gostaria de fazer diferente no próximo projeto?", "Alguma recomendação para projetos futuros?"]}
  ]'::jsonb,
  false
WHERE NOT EXISTS (SELECT 1 FROM one_on_one_templates WHERE name = 'Feedback de Projeto');