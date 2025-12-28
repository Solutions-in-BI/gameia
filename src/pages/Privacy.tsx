/**
 * Página de Política de Privacidade
 * Obrigatória para plataformas B2B (LGPD compliance)
 */

import { motion } from "framer-motion";
import { ArrowLeft, Lock, Calendar, Database, Eye, Trash2, Share2, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/game/common/ThemeToggle";

export default function Privacy() {
  const navigate = useNavigate();
  const lastUpdated = "28 de dezembro de 2024";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Política de Privacidade</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar size={16} />
              <span>Última atualização: {lastUpdated}</span>
            </div>
          </div>

          {/* LGPD Notice */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-primary text-center">
              Esta Política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </div>

          {/* Privacy Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                1. Dados que Coletamos
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Dados de Cadastro:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Nome/Apelido</li>
                    <li>Endereço de e-mail</li>
                    <li>Foto de perfil (opcional)</li>
                    <li>Cargo e departamento (para contas empresariais)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Dados de Uso:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Pontuações e rankings em jogos</li>
                    <li>Progresso em treinamentos</li>
                    <li>Badges e conquistas</li>
                    <li>Tempo de uso e atividades</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Dados Técnicos:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Endereço IP</li>
                    <li>Tipo de navegador e dispositivo</li>
                    <li>Logs de acesso</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                2. Como Usamos seus Dados
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Personalizar sua experiência na Plataforma</li>
                <li>Gerar relatórios de desempenho para sua organização</li>
                <li>Enviar notificações sobre conquistas e atividades</li>
                <li>Garantir a segurança da Plataforma</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                3. Compartilhamento de Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Seus dados podem ser compartilhados apenas:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Com sua organização:</strong> Administradores podem ver métricas de desempenho</li>
                <li><strong>Prestadores de serviço:</strong> Que nos ajudam a operar a Plataforma</li>
                <li><strong>Obrigações legais:</strong> Quando exigido por lei ou ordem judicial</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong>Nunca vendemos seus dados pessoais.</strong>
              </p>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                4. Seus Direitos (LGPD)
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                De acordo com a LGPD, você tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Acesso:</strong> Solicitar cópia dos seus dados</li>
                <li><strong>Correção:</strong> Atualizar dados incorretos ou incompletos</li>
                <li><strong>Exclusão:</strong> Solicitar a remoção dos seus dados</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Revogação:</strong> Retirar consentimento a qualquer momento</li>
                <li><strong>Informação:</strong> Saber com quem seus dados são compartilhados</li>
              </ul>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                5. Segurança dos Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas técnicas e organizacionais para proteger seus dados, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Controle de acesso baseado em funções (RBAC)</li>
                <li>Monitoramento e logs de auditoria</li>
                <li>Backups regulares</li>
                <li>Treinamento de equipe em segurança</li>
              </ul>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-primary" />
                6. Retenção de Dados
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para 
                fornecer serviços. Após exclusão da conta, seus dados serão removidos em até 30 dias, 
                exceto quando houver obrigação legal de retenção.
              </p>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                7. Cookies e Tecnologias Similares
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies essenciais para o funcionamento da Plataforma e cookies 
                de análise para melhorar nossos serviços. Você pode gerenciar suas preferências 
                de cookies nas configurações do navegador.
              </p>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                8. Dados de Menores
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A Plataforma não é destinada a menores de 18 anos. Não coletamos 
                intencionalmente dados de menores. Se identificarmos que coletamos 
                dados de um menor, tomaremos medidas para removê-los.
              </p>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                9. Alterações nesta Política
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta Política periodicamente. Notificaremos sobre 
                mudanças significativas por e-mail ou através da Plataforma. Recomendamos 
                revisar esta página regularmente.
              </p>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                10. Encarregado de Dados (DPO)
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta Política, 
                entre em contato com nosso Encarregado de Proteção de Dados:
              </p>
              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <p className="text-foreground">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:privacidade@gameia.com.br" className="text-primary hover:underline">
                    privacidade@gameia.com.br
                  </a>
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
