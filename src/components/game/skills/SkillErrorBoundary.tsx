/**
 * Error Boundary para o módulo de Skills
 * Fase 5: Error Handling
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class SkillErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SkillErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });

    // Log to skill_events_log if we have access
    this.logError(error, errorInfo);
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      // Import supabase dynamically to avoid circular dependencies
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("skill_events_log").insert({
          user_id: user.id,
          event_type: "error",
          new_value: {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
          },
          source_type: "error_boundary",
        });
      }
    } catch (logError) {
      console.error("Failed to log error to database:", logError);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRetry?.();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {this.props.fallbackTitle || "Erro no módulo de Skills"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com o suporte se o problema persistir.
            </p>
            
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded-lg overflow-auto max-h-40">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={this.handleRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
              <Button variant="ghost" onClick={() => window.location.reload()}>
                Recarregar página
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC para envolver componentes com o error boundary
 */
export function withSkillErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallbackTitle?: string
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <SkillErrorBoundary fallbackTitle={fallbackTitle}>
        <WrappedComponent {...props} />
      </SkillErrorBoundary>
    );
  };
}
