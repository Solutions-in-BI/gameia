-- =============================================
-- FASE 3: CATÁLOGO INICIAL DE INSÍGNIAS V2
-- =============================================

-- A) INSÍGNIAS DE SKILL (PROGRESSIVAS)
-- Memória N1-N3
INSERT INTO insignias (insignia_key, name, description, icon, category, star_level, xp_reward, coins_reward, insignia_type, level, related_skill_ids, unlock_message, is_active)
VALUES 
  ('memoria_n1', 'Memória Iniciante', 'Demonstrou capacidade básica de memorização', '🧠', 'skill', 1, 50, 20, 'skill', 1, ARRAY['cdd494d9-05e5-49ec-913b-56bf108db61e']::UUID[], 'Você completou seus primeiros desafios de memória!', true),
  ('memoria_n2', 'Memória Competente', 'Memória acima da média em situações práticas', '🧠', 'skill', 2, 100, 50, 'skill', 2, ARRAY['cdd494d9-05e5-49ec-913b-56bf108db61e']::UUID[], 'Sua memória está se destacando!', true),
  ('memoria_n3', 'Memória Expert', 'Domínio avançado de técnicas de memorização', '🧠', 'skill', 3, 200, 100, 'skill', 3, ARRAY['cdd494d9-05e5-49ec-913b-56bf108db61e']::UUID[], 'Você é um expert em memorização!', true)
ON CONFLICT (insignia_key) DO NOTHING;

-- Concentração N1-N3
INSERT INTO insignias (insignia_key, name, description, icon, category, star_level, xp_reward, coins_reward, insignia_type, level, related_skill_ids, unlock_message, is_active)
VALUES 
  ('foco_n1', 'Foco Iniciante', 'Primeiros passos em manter concentração', '🎯', 'skill', 1, 50, 20, 'skill', 1, ARRAY['017708b1-e567-4ef5-9b0f-6cc33702a0ce']::UUID[], 'Você está desenvolvendo seu foco!', true),
  ('foco_n2', 'Foco Competente', 'Mantém concentração por períodos prolongados', '🎯', 'skill', 2, 100, 50, 'skill', 2, ARRAY['017708b1-e567-4ef5-9b0f-6cc33702a0ce']::UUID[], 'Sua capacidade de foco está evoluindo!', true),
  ('foco_n3', 'Foco Expert', 'Concentração inabalável mesmo sob pressão', '🎯', 'skill', 3, 200, 100, 'skill', 3, ARRAY['017708b1-e567-4ef5-9b0f-6cc33702a0ce']::UUID[], 'Você é um mestre da concentração!', true)
ON CONFLICT (insignia_key) DO NOTHING;

-- Estratégia N1-N3
INSERT INTO insignias (insignia_key, name, description, icon, category, star_level, xp_reward, coins_reward, insignia_type, level, related_skill_ids, unlock_message, is_active)
VALUES 
  ('estrategia_n1', 'Estrategista Iniciante', 'Primeiras decisões estratégicas corretas', '♟️', 'skill', 1, 50, 20, 'skill', 1, ARRAY['2ba592ea-504b-4856-baa6-d19d3490517c']::UUID[], 'Você está pensando estrategicamente!', true),
  ('estrategia_n2', 'Estrategista Competente', 'Planeja e executa com consistência', '♟️', 'skill', 2, 100, 50, 'skill', 2, ARRAY['2ba592ea-504b-4856-baa6-d19d3490517c']::UUID[], 'Suas estratégias estão funcionando!', true),
  ('estrategia_n3', 'Estrategista Expert', 'Visão de longo prazo excepcional', '♟️', 'skill', 3, 200, 100, 'skill', 3, ARRAY['2ba592ea-504b-4856-baa6-d19d3490517c']::UUID[], 'Você é um mestre estrategista!', true)
ON CONFLICT (insignia_key) DO NOTHING;

-- Lógica N1-N3
INSERT INTO insignias (insignia_key, name, description, icon, category, star_level, xp_reward, coins_reward, insignia_type, level, related_skill_ids, unlock_message, is_active)
VALUES 
  ('logica_n1', 'Lógica Iniciante', 'Resolve problemas simples com raciocínio', '🔢', 'skill', 1, 50, 20, 'skill', 1, ARRAY['fa25c395-1ae8-48d8-ac1e-041d288ce50d']::UUID[], 'Seu raciocínio lógico está se desenvolvendo!', true),
  ('logica_n2', 'Lógica Competente', 'Raciocínio estruturado e consistente', '🔢', 'skill', 2, 100, 50, 'skill', 2, ARRAY['fa25c395-1ae8-48d8-ac1e-041d288ce50d']::UUID[], 'Sua lógica está afiada!', true),
  ('logica_n3', 'Lógica Expert', 'Resolve problemas complexos com facilidade', '🔢', 'skill', 3, 200, 100, 'skill', 3, ARRAY['fa25c395-1ae8-48d8-ac1e-041d288ce50d']::UUID[], 'Você é um expert em lógica!', true)
ON CONFLICT (insignia_key) DO NOTHING;

-- Liderança N1-N3
INSERT INTO insignias (insignia_key, name, description, icon, category, star_level, xp_reward, coins_reward, insignia_type, level, related_skill_ids, unlock_message, is_active)
VALUES 
  ('lideranca_n1', 'Líder Iniciante', 'Primeiros passos em liderar equipes', '👑', 'skill', 1, 50, 20, 'skill', 1, ARRAY['9a52738d-05e1-4adc-98d0-a6008c90c65b']::UUID[], 'Você está assumindo a liderança!', true),
  ('lideranca_n2', 'Líder Competente', 'Influencia positivamente sua equipe', '👑', 'skill', 2, 100, 50, 'skill', 2, ARRAY['9a52738d-05e1-4adc-98d0-a6008c90c65b']::UUID[], 'Sua liderança está fazendo diferença!', true),
  ('lideranca_n3', 'Líder Expert', 'Referência em liderança e desenvolvimento', '👑', 'skill', 3, 200, 100, 'skill', 3, ARRAY['9a52738d-05e1-4adc-98d0-a6008c90c65b']::UUID[], 'Você é um líder nato!', true)
ON CONFLICT (insignia_key) DO NOTHING;

-- Tomada de Decisão N1-N3
INSERT INTO insignias (insignia_key, name, description, icon, category, star_level, xp_reward, coins_reward, insignia_type, level, related_skill_ids, unlock_message, is_active)
VALUES 
  ('decisao_n1', 'Decisor Iniciante', 'Toma decisões simples com confiança', '⚡', 'skill', 1, 50, 20, 'skill', 1, ARRAY['68a96f4b-cfeb-4b2b-8bab-07a1eeead661']::UUID[], 'Você está decidindo com mais segurança!', true),
  ('decisao_n2', 'Decisor Competente', 'Analisa e decide com consistência', '⚡', 'skill', 2, 100, 50, 'skill', 2, ARRAY['68a96f4b-cfeb-4b2b-8bab-07a1eeead661']::UUID[], 'Suas decisões estão mais assertivas!', true),
  ('decisao_n3', 'Decisor Expert', 'Excelência em decisões sob pressão', '⚡', 'skill', 3, 200, 100, 'skill', 3, ARRAY['68a96f4b-cfeb-4b2b-8bab-07a1eeead661']::UUID[], 'Você é um decisor excepcional!', true)
ON CONFLICT (insignia_key) DO NOTHING;

-- B) INSÍGNIAS DE COMPORTAMENTO
INSERT INTO insignias (insignia_key, name, description, icon, category, star_level, xp_reward, coins_reward, insignia_type, level, unlock_message, is_active)
VALUES 
  ('constante', 'Constante', 'Manteve streak de 7 dias seguidos', '🔥', 'behavior', 1, 75, 30, 'behavior', 1, 'Uma semana de dedicação! Continue assim!', true),
  ('dedicado', 'Dedicado', 'Manteve streak de 30 dias seguidos', '🔥', 'behavior', 2, 200, 100, 'behavior', 2, 'Um mês inteiro de constância. Impressionante!', true),
  ('incansavel', 'Incansável', 'Manteve streak de 100 dias seguidos', '🔥', 'behavior', 3, 500, 250, 'behavior', 3, '100 dias! Você é uma inspiração!', true),
  ('engajado', 'Engajado', 'Participou de 50 atividades em 30 dias', '💪', 'behavior', 2, 150, 75, 'behavior', 1, 'Seu engajamento faz a diferença!', true),
  ('superacao', 'Superação', 'Melhorou score pessoal 5 vezes consecutivas', '📈', 'behavior', 2, 100, 50, 'behavior', 1, 'Você está sempre se superando!', true),
  ('explorador', 'Explorador', 'Experimentou 5 tipos diferentes de atividades', '🧭', 'behavior', 1, 60, 25, 'behavior', 1, 'Você está explorando todas as possibilidades!', true),
  ('madrugador', 'Madrugador', 'Completou 10 atividades antes das 9h', '🌅', 'behavior', 1, 50, 20, 'behavior', 1, 'Começando o dia com energia!', true),
  ('noturno', 'Noturno', 'Completou 10 atividades após as 21h', '🌙', 'behavior', 1, 50, 20, 'behavior', 1, 'Aproveitando cada momento para evoluir!', true)
ON CONFLICT (insignia_key) DO NOTHING;

-- C) INSÍGNIAS DE IMPACTO
INSERT INTO insignias (insignia_key, name, description, icon, category, star_level, xp_reward, coins_reward, insignia_type, level, unlock_message, is_active)
VALUES 
  ('cumpridor_metas', 'Cumpridor de Metas', 'Atingiu 3 metas estabelecidas', '🎯', 'impact', 1, 100, 50, 'impact', 1, 'Você entrega resultados!', true),
  ('campeao_resultados', 'Campeão de Resultados', 'Atingiu 10 metas estabelecidas', '🏆', 'impact', 2, 250, 125, 'impact', 2, 'Resultados consistentes!', true),
  ('compromisso_honrado', 'Compromisso Honrado', 'Concluiu 5 compromissos sem atraso', '🤝', 'impact', 2, 150, 75, 'impact', 1, 'Sua palavra vale ouro!', true),
  ('jogador_equipe', 'Jogador de Equipe', 'Participou de 3 desafios coletivos', '👥', 'impact', 1, 100, 50, 'impact', 1, 'Você fortalece a equipe!', true),
  ('colaborador_essencial', 'Colaborador Essencial', 'Contribuiu em 10 desafios coletivos', '🌟', 'impact', 2, 200, 100, 'impact', 2, 'A equipe conta com você!', true),
  ('alta_performance', 'Alta Performance', 'Manteve score acima de 85% em 20 atividades', '💎', 'impact', 3, 300, 150, 'impact', 1, 'Performance excepcional!', true),
  ('treinamento_completo', 'Treinamento Completo', 'Finalizou 5 treinamentos', '📚', 'impact', 2, 150, 75, 'impact', 1, 'Conhecimento aplicado!', true),
  ('aprendiz_dedicado', 'Aprendiz Dedicado', 'Finalizou 15 treinamentos', '🎓', 'impact', 3, 400, 200, 'impact', 2, 'Você é um aprendiz exemplar!', true)
ON CONFLICT (insignia_key) DO NOTHING;

-- D) INSÍGNIAS DE LIDERANÇA
INSERT INTO insignias (insignia_key, name, description, icon, category, star_level, xp_reward, coins_reward, insignia_type, level, unlock_message, is_active)
VALUES 
  ('facilitador', 'Facilitador', 'Deu feedback para 10 colegas', '💬', 'leadership', 1, 100, 50, 'leadership', 1, 'Você ajuda os outros a evoluir!', true),
  ('desenvolvedor_pessoas', 'Desenvolvedor de Pessoas', 'Deu feedback de qualidade para 20 colegas', '🌱', 'leadership', 2, 200, 100, 'leadership', 2, 'Você transforma pessoas!', true),
  ('checkin_master', 'Check-in Master', 'Realizou 10 one-on-ones', '📋', 'leadership', 2, 150, 75, 'leadership', 1, 'Acompanhamento próximo da equipe!', true),
  ('mentor', 'Mentor', 'Membros da sua equipe conquistaram 5 insígnias', '🧙', 'leadership', 3, 300, 150, 'leadership', 1, 'Você é um mentor nato!', true),
  ('inspirador', 'Inspirador', 'Sua equipe teve o melhor resultado do mês', '⭐', 'leadership', 3, 400, 200, 'leadership', 2, 'Você inspira resultados!', true),
  ('coach', 'Coach', 'Ajudou 5 pessoas a melhorarem seus scores', '📊', 'leadership', 2, 175, 85, 'leadership', 1, 'Seu coaching funciona!', true)
ON CONFLICT (insignia_key) DO NOTHING;

-- E) INSÍGNIAS ESPECIAIS / CULTURA
INSERT INTO insignias (insignia_key, name, description, icon, category, star_level, xp_reward, coins_reward, insignia_type, level, unlock_message, is_active)
VALUES 
  ('explorador_gameia', 'Explorador Gameia', 'Utilizou 5 módulos diferentes da plataforma', '🗺️', 'special', 1, 75, 30, 'special', 1, 'Você conhece todo o Gameia!', true),
  ('early_adopter', 'Early Adopter', 'Entre os primeiros a usar uma nova funcionalidade', '🚀', 'special', 2, 100, 50, 'special', 1, 'Você é um pioneiro!', true),
  ('pioneiro', 'Pioneiro', 'Primeiro da equipe a conquistar uma insígnia de skill N3', '🏅', 'special', 3, 200, 100, 'special', 1, 'Você abriu caminho!', true),
  ('colecionador', 'Colecionador', 'Conquistou 10 insígnias diferentes', '📦', 'special', 1, 100, 50, 'special', 1, 'Sua coleção está crescendo!', true),
  ('grande_colecionador', 'Grande Colecionador', 'Conquistou 25 insígnias diferentes', '🗃️', 'special', 2, 250, 125, 'special', 2, 'Uma coleção impressionante!', true),
  ('mestre_colecionador', 'Mestre Colecionador', 'Conquistou 50 insígnias diferentes', '👑', 'special', 3, 500, 250, 'special', 3, 'Você domina o Gameia!', true),
  ('primeira_vitoria', 'Primeira Vitória', 'Completou sua primeira atividade', '🎉', 'special', 1, 25, 10, 'special', 1, 'Bem-vindo ao Gameia!', true),
  ('primeiro_quiz', 'Primeiro Quiz', 'Completou seu primeiro quiz', '❓', 'special', 1, 25, 10, 'special', 1, 'O conhecimento é poder!', true),
  ('primeiro_treinamento', 'Primeiro Treinamento', 'Completou seu primeiro treinamento', '📖', 'special', 1, 25, 10, 'special', 1, 'Sua jornada de aprendizado começou!', true)
ON CONFLICT (insignia_key) DO NOTHING;