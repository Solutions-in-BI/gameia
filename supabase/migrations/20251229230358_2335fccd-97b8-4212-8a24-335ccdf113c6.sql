-- =============================================
-- FASE 3B: CRITÉRIOS E PRÉ-REQUISITOS
-- =============================================

-- Atualizar pré-requisitos das insígnias progressivas (N2 requer N1, N3 requer N2)
UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'memoria_n1')]::UUID[] WHERE insignia_key = 'memoria_n2';
UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'memoria_n2')]::UUID[] WHERE insignia_key = 'memoria_n3';

UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'foco_n1')]::UUID[] WHERE insignia_key = 'foco_n2';
UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'foco_n2')]::UUID[] WHERE insignia_key = 'foco_n3';

UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'estrategia_n1')]::UUID[] WHERE insignia_key = 'estrategia_n2';
UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'estrategia_n2')]::UUID[] WHERE insignia_key = 'estrategia_n3';

UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'logica_n1')]::UUID[] WHERE insignia_key = 'logica_n2';
UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'logica_n2')]::UUID[] WHERE insignia_key = 'logica_n3';

UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'lideranca_n1')]::UUID[] WHERE insignia_key = 'lideranca_n2';
UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'lideranca_n2')]::UUID[] WHERE insignia_key = 'lideranca_n3';

UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'decisao_n1')]::UUID[] WHERE insignia_key = 'decisao_n2';
UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'decisao_n2')]::UUID[] WHERE insignia_key = 'decisao_n3';

-- Pré-requisitos das insígnias de comportamento
UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'constante')]::UUID[] WHERE insignia_key = 'dedicado';
UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'dedicado')]::UUID[] WHERE insignia_key = 'incansavel';

-- Pré-requisitos das insígnias de colecionador
UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'colecionador')]::UUID[] WHERE insignia_key = 'grande_colecionador';
UPDATE insignias SET prerequisites = ARRAY[(SELECT id FROM insignias WHERE insignia_key = 'grande_colecionador')]::UUID[] WHERE insignia_key = 'mestre_colecionador';

-- =============================================
-- CRITÉRIOS DAS INSÍGNIAS
-- =============================================

-- Critérios para Insígnias de Skill (Memória)
INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, description, is_required, weight, context_config)
SELECT id, 'event_count', 'JOGO_CONCLUIDO', 5, 'Completar 5 jogos de memória', true, 1, '{"game_type": "memory"}'::JSONB
FROM insignias WHERE insignia_key = 'memoria_n1';

INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, avg_value, description, is_required, weight, context_config)
SELECT id, 'event_count', 'JOGO_CONCLUIDO', 15, 0, 'Completar 15 jogos de memória', true, 1, '{"game_type": "memory"}'::JSONB
FROM insignias WHERE insignia_key = 'memoria_n2';

INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, avg_value, description, is_required, weight, context_config)
SELECT id, 'event_avg_score', 'JOGO_CONCLUIDO', 75, 'Média de score >= 75%', true, 1, '{"game_type": "memory"}'::JSONB
FROM insignias WHERE insignia_key = 'memoria_n2';

INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, description, is_required, weight, context_config)
SELECT id, 'event_count', 'JOGO_CONCLUIDO', 30, 'Completar 30 jogos de memória', true, 1, '{"game_type": "memory"}'::JSONB
FROM insignias WHERE insignia_key = 'memoria_n3';

INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, avg_value, description, is_required, weight, context_config)
SELECT id, 'event_avg_score', 'JOGO_CONCLUIDO', 85, 'Média de score >= 85%', true, 1, '{"game_type": "memory"}'::JSONB
FROM insignias WHERE insignia_key = 'memoria_n3';

-- Critérios para Insígnias de Comportamento
INSERT INTO insignia_criteria (insignia_id, criterion_type, min_value, description, is_required, weight)
SELECT id, 'streak_days', 7, 'Manter streak de 7 dias', true, 1
FROM insignias WHERE insignia_key = 'constante';

INSERT INTO insignia_criteria (insignia_id, criterion_type, min_value, description, is_required, weight)
SELECT id, 'streak_days', 30, 'Manter streak de 30 dias', true, 1
FROM insignias WHERE insignia_key = 'dedicado';

INSERT INTO insignia_criteria (insignia_id, criterion_type, min_value, description, is_required, weight)
SELECT id, 'streak_days', 100, 'Manter streak de 100 dias', true, 1
FROM insignias WHERE insignia_key = 'incansavel';

INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, time_window_days, description, is_required, weight)
SELECT id, 'event_count', NULL, 50, 30, 'Participar de 50 atividades em 30 dias', true, 1
FROM insignias WHERE insignia_key = 'engajado';

INSERT INTO insignia_criteria (insignia_id, criterion_type, min_count, description, is_required, weight)
SELECT id, 'diversity', 5, 'Experimentar 5 tipos diferentes de atividades', true, 1
FROM insignias WHERE insignia_key = 'explorador';

-- Critérios para Insígnias de Impacto
INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, description, is_required, weight)
SELECT id, 'event_count', 'META_ATINGIDA', 3, 'Atingir 3 metas', true, 1
FROM insignias WHERE insignia_key = 'cumpridor_metas';

INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, description, is_required, weight)
SELECT id, 'event_count', 'META_ATINGIDA', 10, 'Atingir 10 metas', true, 1
FROM insignias WHERE insignia_key = 'campeao_resultados';

INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, description, is_required, weight)
SELECT id, 'event_count', 'TREINAMENTO_CONCLUIDO', 5, 'Concluir 5 treinamentos', true, 1
FROM insignias WHERE insignia_key = 'treinamento_completo';

INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, description, is_required, weight)
SELECT id, 'event_count', 'TREINAMENTO_CONCLUIDO', 15, 'Concluir 15 treinamentos', true, 1
FROM insignias WHERE insignia_key = 'aprendiz_dedicado';

INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, min_value, description, is_required, weight)
SELECT id, 'consecutive', 'JOGO_CONCLUIDO', 20, 85, 'Manter score >= 85% em 20 atividades', true, 1
FROM insignias WHERE insignia_key = 'alta_performance';

-- Critérios para Insígnias de Liderança
INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, description, is_required, weight)
SELECT id, 'event_count', 'FEEDBACK_DADO', 10, 'Dar feedback para 10 colegas', true, 1
FROM insignias WHERE insignia_key = 'facilitador';

INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, description, is_required, weight)
SELECT id, 'event_count', 'FEEDBACK_DADO', 20, 'Dar feedback para 20 colegas', true, 1
FROM insignias WHERE insignia_key = 'desenvolvedor_pessoas';

-- Critérios para Insígnias Especiais
INSERT INTO insignia_criteria (insignia_id, criterion_type, min_count, description, is_required, weight)
SELECT id, 'diversity', 5, 'Usar 5 módulos diferentes', true, 1
FROM insignias WHERE insignia_key = 'explorador_gameia';

INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, description, is_required, weight)
SELECT id, 'event_count', 'JOGO_CONCLUIDO', 1, 'Completar primeira atividade', true, 1
FROM insignias WHERE insignia_key = 'primeira_vitoria';

INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, description, is_required, weight, context_config)
SELECT id, 'event_count', 'JOGO_CONCLUIDO', 1, 'Completar primeiro quiz', true, 1, '{"game_type": "quiz"}'::JSONB
FROM insignias WHERE insignia_key = 'primeiro_quiz';

INSERT INTO insignia_criteria (insignia_id, criterion_type, event_type, min_count, description, is_required, weight)
SELECT id, 'event_count', 'TREINAMENTO_CONCLUIDO', 1, 'Completar primeiro treinamento', true, 1
FROM insignias WHERE insignia_key = 'primeiro_treinamento';