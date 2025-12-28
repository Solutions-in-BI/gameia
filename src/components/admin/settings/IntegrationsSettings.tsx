/**
 * Integrations Management - API Keys & Webhooks
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Webhook,
  Plus,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Clock,
  Activity,
  Code,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIntegrations, ApiKey, Webhook as WebhookType } from '@/hooks/useIntegrations';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { UpgradePrompt } from '@/components/common/UpgradePrompt';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function IntegrationsSettings() {
  const {
    apiKeys,
    webhooks,
    isLoading,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    getApiEndpoint,
    AVAILABLE_SCOPES,
    AVAILABLE_EVENTS,
  } = useIntegrations();

  const { hasMinimumPlan, isLoading: planLoading } = usePlanLimits();

  useEffect(() => {
    fetchApiKeys();
    fetchWebhooks();
  }, [fetchApiKeys, fetchWebhooks]);

  // Check plan access
  if (planLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasMinimumPlan('business')) {
    return (
      <div className="max-w-md mx-auto">
        <UpgradePrompt
          feature="API & Webhooks"
          requiredPlan="Business"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Integrações</h2>
        <p className="text-sm text-muted-foreground">
          Configure API keys e webhooks para integrar com sistemas externos
        </p>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="api-keys" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-2">
            <Code className="h-4 w-4" />
            Documentação
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Use API keys para acessar a API pública da sua organização
            </p>
            <CreateApiKeyDialog 
              onCreateKey={createApiKey} 
              scopes={AVAILABLE_SCOPES} 
            />
          </div>

          <div className="space-y-3">
            {apiKeys.length === 0 && !isLoading && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Key className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">Nenhuma API key criada</p>
                  <p className="text-sm text-muted-foreground/70">
                    Crie uma key para começar a integrar
                  </p>
                </CardContent>
              </Card>
            )}

            <AnimatePresence>
              {apiKeys.map((key) => (
                <ApiKeyCard 
                  key={key.id} 
                  apiKey={key} 
                  onRevoke={revokeApiKey} 
                />
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Configure webhooks para receber notificações de eventos
            </p>
            <CreateWebhookDialog 
              onCreateWebhook={createWebhook} 
              events={AVAILABLE_EVENTS} 
            />
          </div>

          <div className="space-y-3">
            {webhooks.length === 0 && !isLoading && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Webhook className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">Nenhum webhook configurado</p>
                  <p className="text-sm text-muted-foreground/70">
                    Configure um webhook para receber eventos
                  </p>
                </CardContent>
              </Card>
            )}

            <AnimatePresence>
              {webhooks.map((webhook) => (
                <WebhookCard 
                  key={webhook.id} 
                  webhook={webhook}
                  onUpdate={updateWebhook}
                  onDelete={deleteWebhook}
                  events={AVAILABLE_EVENTS}
                />
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-4">
          <ApiDocumentation endpoint={getApiEndpoint()} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// API Key Card Component
function ApiKeyCard({ 
  apiKey, 
  onRevoke 
}: { 
  apiKey: ApiKey; 
  onRevoke: (id: string) => void;
}) {
  const isExpired = apiKey.expires_at && new Date(apiKey.expires_at) < new Date();
  const isRevoked = !!apiKey.revoked_at;
  const isActive = apiKey.is_active && !isExpired && !isRevoked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card className={cn(!isActive && 'opacity-60')}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{apiKey.name}</h4>
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isRevoked ? 'Revogada' : isExpired ? 'Expirada' : 'Ativa'}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <code className="px-2 py-0.5 bg-muted rounded text-xs">
                  {apiKey.key_prefix}...
                </code>
                <span>•</span>
                <span>{apiKey.scopes?.join(', ') || 'read'}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Criada {formatDistanceToNow(new Date(apiKey.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
                {apiKey.last_used_at && (
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Usada {formatDistanceToNow(new Date(apiKey.last_used_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                )}
                {apiKey.expires_at && (
                  <span className={cn(
                    "flex items-center gap-1",
                    isExpired && "text-destructive"
                  )}>
                    <AlertTriangle className="h-3 w-3" />
                    {isExpired ? 'Expirou' : 'Expira'} {formatDistanceToNow(new Date(apiKey.expires_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                )}
              </div>
            </div>

            {isActive && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revogar API Key?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Qualquer sistema usando esta key perderá acesso.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onRevoke(apiKey.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Revogar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Create API Key Dialog
function CreateApiKeyDialog({ 
  onCreateKey, 
  scopes 
}: { 
  onCreateKey: (name: string, scopes: string[], expiresInDays?: number) => Promise<any>;
  scopes: Array<{ value: string; label: string; description: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read']);
  const [expiresIn, setExpiresIn] = useState<string>('never');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsCreating(true);
    const expiresInDays = expiresIn === 'never' ? undefined : parseInt(expiresIn);
    const result = await onCreateKey(name, selectedScopes, expiresInDays);
    setIsCreating(false);

    if (result?.rawKey) {
      setCreatedKey(result.rawKey);
    }
  };

  const handleCopy = async () => {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setName('');
    setSelectedScopes(['read']);
    setExpiresIn('never');
    setCreatedKey(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar API Key</DialogTitle>
          <DialogDescription>
            Crie uma nova chave para acessar a API
          </DialogDescription>
        </DialogHeader>

        {!createdKey ? (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Integração CRM"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Permissões</Label>
              <div className="space-y-2">
                {scopes.map((scope) => (
                  <div key={scope.value} className="flex items-start gap-2">
                    <Checkbox
                      id={scope.value}
                      checked={selectedScopes.includes(scope.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedScopes([...selectedScopes, scope.value]);
                        } else {
                          setSelectedScopes(selectedScopes.filter(s => s !== scope.value));
                        }
                      }}
                    />
                    <div className="grid gap-1 leading-none">
                      <label htmlFor={scope.value} className="text-sm font-medium cursor-pointer">
                        {scope.label}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {scope.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expiração</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Nunca expira</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                  <SelectItem value="365">1 ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCreate} 
              className="w-full"
              disabled={!name.trim() || isCreating}
            >
              {isCreating ? 'Criando...' : 'Criar API Key'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  Salve esta chave agora!
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Esta chave não será mostrada novamente. Copie e guarde em local seguro.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={createdKey}
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button variant="outline" onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Webhook Card Component
function WebhookCard({ 
  webhook,
  onUpdate,
  onDelete,
  events,
}: { 
  webhook: WebhookType;
  onUpdate: (id: string, updates: Partial<WebhookType>) => void;
  onDelete: (id: string) => void;
  events: Array<{ value: string; label: string }>;
}) {
  const getEventLabel = (event: string) => {
    return events.find(e => e.value === event)?.label || event;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{webhook.name}</h4>
                <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                  {webhook.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground break-all">
                <code className="px-2 py-0.5 bg-muted rounded text-xs">
                  {webhook.url}
                </code>
              </div>

              <div className="flex flex-wrap gap-1">
                {webhook.events?.map((event) => (
                  <Badge key={event} variant="outline" className="text-xs">
                    {getEventLabel(event)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={webhook.is_active}
                onCheckedChange={(checked) => onUpdate(webhook.id, { is_active: checked })}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover Webhook?</AlertDialogTitle>
                    <AlertDialogDescription>
                      O webhook será removido permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(webhook.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Create Webhook Dialog
function CreateWebhookDialog({ 
  onCreateWebhook, 
  events 
}: { 
  onCreateWebhook: (name: string, url: string, events: string[]) => Promise<any>;
  events: Array<{ value: string; label: string; description: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !url.trim() || selectedEvents.length === 0) return;

    setIsCreating(true);
    const result = await onCreateWebhook(name, url, selectedEvents);
    setIsCreating(false);

    if (result?.secret) {
      setCreatedSecret(result.secret);
    }
  };

  const handleCopy = async () => {
    if (createdSecret) {
      await navigator.clipboard.writeText(createdSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setName('');
    setUrl('');
    setSelectedEvents([]);
    setCreatedSecret(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Webhook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Webhook</DialogTitle>
          <DialogDescription>
            Configure um endpoint para receber eventos
          </DialogDescription>
        </DialogHeader>

        {!createdSecret ? (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Notificações Slack"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>URL do Endpoint</Label>
              <Input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Eventos</Label>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="space-y-2">
                  {events.map((event) => (
                    <div key={event.value} className="flex items-start gap-2">
                      <Checkbox
                        id={event.value}
                        checked={selectedEvents.includes(event.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEvents([...selectedEvents, event.value]);
                          } else {
                            setSelectedEvents(selectedEvents.filter(e => e !== event.value));
                          }
                        }}
                      />
                      <div className="grid gap-1 leading-none">
                        <label htmlFor={event.value} className="text-sm font-medium cursor-pointer">
                          {event.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Button 
              onClick={handleCreate} 
              className="w-full"
              disabled={!name.trim() || !url.trim() || selectedEvents.length === 0 || isCreating}
            >
              {isCreating ? 'Criando...' : 'Criar Webhook'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-600 dark:text-green-400">
                  Webhook criado!
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Use este secret para validar as requisições:
              </p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={createdSecret}
                  className="font-mono text-xs"
                />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button variant="outline" onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// API Documentation Component
function ApiDocumentation({ endpoint }: { endpoint: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const examples = [
    {
      title: 'Listar Membros',
      method: 'GET',
      path: '/members',
      curl: `curl -X GET "${endpoint}/members" \\
  -H "x-api-key: gsk_your_api_key"`,
    },
    {
      title: 'Obter Métricas',
      method: 'GET',
      path: '/metrics',
      curl: `curl -X GET "${endpoint}/metrics?period=30d" \\
  -H "x-api-key: gsk_your_api_key"`,
    },
    {
      title: 'Listar Atividades',
      method: 'GET',
      path: '/activities',
      curl: `curl -X GET "${endpoint}/activities?limit=50" \\
  -H "x-api-key: gsk_your_api_key"`,
    },
    {
      title: 'Leaderboard',
      method: 'GET',
      path: '/leaderboard',
      curl: `curl -X GET "${endpoint}/leaderboard?period=30d&limit=20" \\
  -H "x-api-key: gsk_your_api_key"`,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Base URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono">
              {endpoint}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(endpoint, 'base')}
            >
              {copied === 'base' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Autenticação</CardTitle>
          <CardDescription>
            Inclua sua API key no header de todas as requisições
          </CardDescription>
        </CardHeader>
        <CardContent>
          <code className="block px-3 py-2 bg-muted rounded text-sm font-mono">
            x-api-key: gsk_your_api_key
          </code>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium">Endpoints Disponíveis</h3>
        {examples.map((example, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{example.method}</Badge>
                <CardTitle className="text-sm font-mono">{example.path}</CardTitle>
              </div>
              <CardDescription>{example.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="p-3 bg-muted rounded text-xs font-mono overflow-x-auto">
                  {example.curl}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => handleCopy(example.curl, `curl-${i}`)}
                >
                  {copied === `curl-${i}` ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
