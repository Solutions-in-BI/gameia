/**
 * Página de Termos de Uso
 * Obrigatória para plataformas B2B
 */

import { motion } from "framer-motion";
import { ArrowLeft, FileText, Calendar, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/game/common/ThemeToggle";

export default function Terms() {
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
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Termos de Uso</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar size={16} />
              <span>Última atualização: {lastUpdated}</span>
            </div>
          </div>

          {/* Terms Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                1. Aceitação dos Termos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar ou utilizar a plataforma Gameia ("Plataforma"), você concorda em 
                estar vinculado a estes Termos de Uso. Se você não concordar com qualquer 
                parte destes termos, não poderá acessar ou utilizar a Plataforma.
              </p>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                2. Descrição do Serviço
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A Gameia é uma plataforma de gamificação corporativa que oferece jogos 
                educativos, treinamentos, avaliações de competências e ferramentas de 
                engajamento para organizações e seus colaboradores.
              </p>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                3. Cadastro e Conta
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Você deve fornecer informações precisas e completas ao se cadastrar.</li>
                <li>É sua responsabilidade manter a confidencialidade de suas credenciais.</li>
                <li>Você é responsável por todas as atividades realizadas em sua conta.</li>
                <li>Deve notificar imediatamente sobre qualquer uso não autorizado.</li>
              </ul>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                4. Uso Aceitável
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ao utilizar a Plataforma, você concorda em:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Não violar leis ou regulamentos aplicáveis.</li>
                <li>Não transmitir conteúdo ilegal, ofensivo ou prejudicial.</li>
                <li>Não tentar acessar áreas restritas sem autorização.</li>
                <li>Não interferir no funcionamento adequado da Plataforma.</li>
                <li>Não coletar dados de outros usuários sem consentimento.</li>
              </ul>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                5. Propriedade Intelectual
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo da Plataforma, incluindo textos, gráficos, logos, ícones, 
                imagens, clipes de áudio e software, é de propriedade da Gameia ou de seus 
                licenciadores e está protegido por leis de propriedade intelectual.
              </p>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                6. Licença de Uso para Empresas (B2B)
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para clientes empresariais:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>A licença é concedida conforme o plano contratado.</li>
                <li>O número de usuários é limitado ao contratado.</li>
                <li>Dados da organização são de propriedade do cliente.</li>
                <li>Métricas agregadas podem ser usadas para melhorias da Plataforma.</li>
              </ul>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                7. Limitação de Responsabilidade
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A Plataforma é fornecida "como está". Não garantimos que o serviço será 
                ininterrupto ou livre de erros. Em nenhuma circunstância seremos responsáveis 
                por danos indiretos, incidentais, especiais ou consequentes.
              </p>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                8. Modificações
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamos o direito de modificar estes Termos a qualquer momento. 
                Notificaremos sobre mudanças significativas. O uso continuado após 
                modificações constitui aceitação dos novos termos.
              </p>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                9. Rescisão
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos suspender ou encerrar seu acesso a qualquer momento, por qualquer 
                motivo, incluindo violação destes Termos. Você pode encerrar sua conta 
                a qualquer momento através das configurações.
              </p>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                10. Lei Aplicável
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos são regidos pelas leis da República Federativa do Brasil. 
                Qualquer disputa será resolvida nos tribunais competentes do Brasil.
              </p>
            </section>

            <section className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                11. Contato
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Para dúvidas sobre estes Termos, entre em contato através do email: 
                <a href="mailto:contato@gameia.com.br" className="text-primary ml-1 hover:underline">
                  contato@gameia.com.br
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
