/**
 * TeamCertificatesDashboard - Dashboard gerencial expandido para certificados
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Award, Search, Filter, Download, Calendar, Users,
  CheckCircle2, Clock, XCircle, TrendingUp, BarChart3,
  BookOpen, Route, Star, Medal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrgCertificates, type OrgCertificate } from "@/hooks/useCertificates";
import { CertificateApprovalQueue } from "./CertificateApprovalQueue";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useOrganization } from "@/hooks/useOrganization";

const CERTIFICATE_TYPES = [
  { value: "all", label: "Todos", icon: Award },
  { value: "training", label: "Treinamento", icon: BookOpen },
  { value: "journey", label: "Jornada", icon: Route },
  { value: "skill", label: "Skill", icon: Star },
  { value: "level", label: "Nível", icon: Medal },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "pending_approval", label: "Aguardando" },
  { value: "expired", label: "Expirados" },
];

export function TeamCertificatesDashboard() {
  const { currentOrg } = useOrganization();
  const { certificates, stats, isLoading } = useOrgCertificates(currentOrg?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    if (!certificates) return [];
    
    return certificates.filter(cert => {
      const userName = cert.user?.nickname || "";
      const certName = cert.metadata?.certificate_name || cert.training?.name || "";
      
      const matchesSearch = searchQuery === "" || 
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        certName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "all" || 
        (cert as any).certificate_type === typeFilter ||
        (typeFilter === "training" && !(cert as any).certificate_type);
      
      const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [certificates, searchQuery, typeFilter, statusFilter]);

  // Pending approvals
  const pendingApprovals = useMemo(() => {
    return certificates?.filter((c: OrgCertificate) => (c as any).status === 'pending_approval') || [];
  }, [certificates]);

  // Group by user
  const certificatesByUser = useMemo(() => {
    const grouped: Record<string, { user: OrgCertificate['user']; certificates: OrgCertificate[]; count: number }> = {};
    
    filteredCertificates.forEach((cert: OrgCertificate) => {
      const userId = cert.user_id;
      if (!grouped[userId]) {
        grouped[userId] = {
          user: cert.user,
          certificates: [],
          count: 0,
        };
      }
      grouped[userId].certificates.push(cert);
      grouped[userId].count++;
    });
    
    return Object.values(grouped).sort((a, b) => b.count - a.count);
  }, [filteredCertificates]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Certificados da Equipe
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie certificados e aprovações
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.active || 0}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={pendingApprovals.length > 0 ? "border-amber-500/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingApprovals.length}</p>
                <p className="text-xs text-muted-foreground">Aguardando</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.thisMonth || 0}</p>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="approvals" className="relative">
            Aprovações
            {pendingApprovals.length > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 justify-center bg-amber-500">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="by-person">Por Pessoa</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nome ou certificado..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {CERTIFICATE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Certificates Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Certificado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Nota</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum certificado encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCertificates.slice(0, 20).map(cert => (
                      <TableRow key={cert.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={cert.user?.avatar_url} />
                              <AvatarFallback>
                                {cert.user?.nickname?.slice(0, 2).toUpperCase() || "??"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">
                              {cert.user?.nickname || "Usuário"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {cert.metadata?.certificate_name || cert.training?.name || "Certificado"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {(cert as any).certificate_type || "training"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              (cert as any).status === 'active' ? 'bg-green-500/10 text-green-500' :
                              (cert as any).status === 'pending_approval' ? 'bg-amber-500/10 text-amber-500' :
                              'bg-gray-500/10 text-gray-500'
                            }
                          >
                            {(cert as any).status === 'active' ? 'Ativo' :
                             (cert as any).status === 'pending_approval' ? 'Aguardando' :
                             (cert as any).status === 'expired' ? 'Expirado' : (cert as any).status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(cert.issued_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {cert.final_score ? (
                            <Badge variant="secondary">{cert.final_score}%</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals">
          <CertificateApprovalQueue certificates={pendingApprovals} />
        </TabsContent>

        {/* By Person Tab */}
        <TabsContent value="by-person" className="space-y-4">
          {certificatesByUser.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum colaborador com certificados</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificatesByUser.map(({ user, certificates: userCerts, count }) => (
                <Card key={user?.id || 'unknown'} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar_url} />
                        <AvatarFallback>
                          {user?.nickname?.slice(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user?.nickname || "Usuário"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {count} certificado{count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-lg font-bold">
                        {count}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {userCerts.slice(0, 3).map(cert => (
                        <Badge key={cert.id} variant="outline" className="text-xs">
                          {cert.metadata?.certificate_name?.slice(0, 15) || 
                           cert.training?.name?.slice(0, 15) || "Cert"}...
                        </Badge>
                      ))}
                      {userCerts.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{userCerts.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
