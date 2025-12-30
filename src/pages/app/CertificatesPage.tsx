/**
 * CertificatesPage - Área de Certificados Inteligente
 * Certificado = Evidência + Contexto + Métrica
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Award, BookOpen, Route, Star, Medal, Users, 
  Search, Filter, Download, Share2, Calendar,
  CheckCircle2, Clock, XCircle, TrendingUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCertificates } from "@/hooks/useCertificates";
import { CertificateTypeCard } from "@/components/certificates/CertificateTypeCard";
import { CertificateDetailDrawer } from "@/components/certificates/CertificateDetailDrawer";
import { UpcomingCertificates } from "@/components/certificates/UpcomingCertificates";
import { Skeleton } from "@/components/ui/skeleton";
import type { CertificateWithDetails } from "@/hooks/useCertificates";

const CERTIFICATE_TYPES = [
  { value: "all", label: "Todos", icon: Award },
  { value: "training", label: "Treinamento", icon: BookOpen },
  { value: "journey", label: "Jornada", icon: Route },
  { value: "skill", label: "Skill", icon: Star },
  { value: "level", label: "Nível", icon: Medal },
  { value: "behavioral", label: "Comportamental", icon: Users },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos os Status" },
  { value: "active", label: "Ativos" },
  { value: "pending_approval", label: "Aguardando Aprovação" },
  { value: "expired", label: "Expirados" },
  { value: "revoked", label: "Revogados" },
];

export default function CertificatesPage() {
  const { certificates, isLoading, stats } = useCertificates();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateWithDetails | null>(null);

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    if (!certificates) return [];
    
    return certificates.filter(cert => {
      const matchesSearch = searchQuery === "" || 
        (cert.metadata?.certificate_name || cert.training?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "all" || 
        (cert as any).certificate_type === typeFilter ||
        (typeFilter === "training" && !(cert as any).certificate_type);
      
      const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [certificates, searchQuery, typeFilter, statusFilter]);

  // Group certificates by type
  const certificatesByType = useMemo(() => {
    const grouped: Record<string, CertificateWithDetails[]> = {
      training: [],
      journey: [],
      skill: [],
      level: [],
      behavioral: [],
    };
    
    filteredCertificates.forEach(cert => {
      const type = (cert as any).certificate_type || "training";
      if (grouped[type]) {
        grouped[type].push(cert);
      }
    });
    
    return grouped;
  }, [filteredCertificates]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Award className="w-7 h-7 text-primary" />
            Meus Certificados
          </h1>
          <p className="text-muted-foreground mt-1">
            Evidências formais de suas competências e evolução
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total de Certificados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.active || 0}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {certificates?.filter(c => c.status === 'pending_approval').length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Aguardando</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Object.keys(stats?.byCategory || {}).length}
                </p>
                <p className="text-xs text-muted-foreground">Categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar certificados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {CERTIFICATE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
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

      {/* Certificates by Type Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto gap-1">
          {CERTIFICATE_TYPES.map(type => {
            const count = type.value === "all" 
              ? filteredCertificates.length 
              : certificatesByType[type.value]?.length || 0;
            
            return (
              <TabsTrigger 
                key={type.value} 
                value={type.value}
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <type.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{type.label}</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* All Certificates */}
        <TabsContent value="all" className="space-y-6">
          {/* Próximos Certificados */}
          <UpcomingCertificates />

          {/* Lista de Certificados */}
          {filteredCertificates.length === 0 ? (
            <Card className="p-12 text-center">
              <Award className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Nenhum certificado encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Complete treinamentos, jornadas e desafios para conquistar certificados
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCertificates.map(cert => (
                <CertificateTypeCard 
                  key={cert.id}
                  certificate={cert}
                  onClick={() => setSelectedCertificate(cert)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Type-specific tabs */}
        {CERTIFICATE_TYPES.filter(t => t.value !== "all").map(type => (
          <TabsContent key={type.value} value={type.value} className="space-y-4">
            {certificatesByType[type.value]?.length === 0 ? (
              <Card className="p-12 text-center">
                <type.icon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  Nenhum certificado de {type.label.toLowerCase()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {type.value === "training" && "Complete treinamentos para conquistar certificados"}
                  {type.value === "journey" && "Finalize jornadas completas para certificação"}
                  {type.value === "skill" && "Desenvolva skills específicas para receber certificados"}
                  {type.value === "level" && "Evolua de nível para conquistar certificados"}
                  {type.value === "behavioral" && "Obtenha feedback 360 para certificados comportamentais"}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificatesByType[type.value]?.map(cert => (
                  <CertificateTypeCard 
                    key={cert.id}
                    certificate={cert}
                    onClick={() => setSelectedCertificate(cert)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Detail Drawer */}
      <CertificateDetailDrawer
        certificate={selectedCertificate}
        isOpen={!!selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />
    </motion.div>
  );
}
