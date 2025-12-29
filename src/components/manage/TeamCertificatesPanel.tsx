/**
 * TeamCertificatesPanel - Painel de certificados por equipe no /manage
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Award, 
  Search, 
  Filter, 
  TrendingUp, 
  Users,
  Calendar,
  Download,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrgCertificates } from "@/hooks/useCertificates";
import { useOrganization } from "@/hooks/useOrganization";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type ViewMode = 'team' | 'person' | 'skill';

export function TeamCertificatesPanel() {
  const { currentOrg } = useOrganization();
  const { certificates, stats, isLoading } = useOrgCertificates(currentOrg?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('person');
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(certificates.map((c: any) => c.training?.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [certificates]);

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert: any) => {
      const matchesSearch = 
        (cert.profile?.nickname || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cert.training?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || cert.training?.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [certificates, searchQuery, categoryFilter]);

  // Group by person
  const byPerson = useMemo(() => {
    const grouped: Record<string, { profile: any; certificates: any[] }> = {};
    filteredCertificates.forEach((cert: any) => {
      const id = cert.profile?.id || cert.user_id;
      if (!grouped[id]) {
        grouped[id] = {
          profile: cert.profile,
          certificates: []
        };
      }
      grouped[id].certificates.push(cert);
    });
    return Object.values(grouped);
  }, [filteredCertificates]);

  // Group by skill (from training category)
  const byCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredCertificates.forEach((cert: any) => {
      const category = cert.training?.category || 'Outros';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(cert);
    });
    return grouped;
  }, [filteredCertificates]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Certificados da Equipe
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe as certificações e competências validadas
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
              <p className="text-sm text-muted-foreground">Total Emitidos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.active || 0}</p>
              <p className="text-sm text-muted-foreground">Ativos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.thisMonth || 0}</p>
              <p className="text-sm text-muted-foreground">Este Mês</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por pessoa ou treinamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Por Pessoa</SelectItem>
                <SelectItem value="skill">Por Categoria</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content based on view mode */}
      {viewMode === 'person' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Certificados por Pessoa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Certificados</TableHead>
                  <TableHead>Último</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byPerson.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum certificado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  byPerson.map((item: any, index) => (
                    <TableRow key={item.profile?.id || index}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={item.profile?.avatar_url} />
                            <AvatarFallback>
                              {(item.profile?.nickname || "?")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {item.profile?.nickname || "Usuário"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.certificates.length}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.certificates[0] && format(
                          new Date(item.certificates[0].issued_at), 
                          "dd MMM yyyy", 
                          { locale: ptBR }
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {viewMode === 'skill' && (
        <div className="grid gap-4">
          {Object.entries(byCategory).length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum certificado encontrado</p>
            </Card>
          ) : (
            Object.entries(byCategory).map(([category, certs]) => (
              <Card key={category}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{category}</CardTitle>
                    <Badge>{certs.length} certificados</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {certs.slice(0, 5).map((cert: any) => (
                      <div 
                        key={cert.id} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full"
                      >
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={cert.profile?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {(cert.profile?.nickname || "?")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{cert.profile?.nickname}</span>
                      </div>
                    ))}
                    {certs.length > 5 && (
                      <Badge variant="outline">+{certs.length - 5}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}
