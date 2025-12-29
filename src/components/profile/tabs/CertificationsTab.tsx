/**
 * CertificationsTab - Aba de Certificações no Perfil
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Search, Filter, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCertificates, CertificateWithDetails } from "@/hooks/useCertificates";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { CertificateDetailModal } from "@/components/certificates/CertificateDetailModal";
import { toast } from "sonner";

export function CertificationsTab() {
  const { certificates, stats, isLoading, downloadCertificate } = useCertificates();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateWithDetails | null>(null);

  // Get unique categories from certificates
  const categories = [...new Set(certificates.map(c => c.training?.category).filter(Boolean))];

  // Filter certificates
  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      (cert.metadata?.certificate_name || cert.training?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || cert.training?.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleView = (cert: CertificateWithDetails) => {
    setSelectedCertificate(cert);
  };

  const handleDownload = async (certId: string) => {
    const url = await downloadCertificate(certId);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleShare = (cert: CertificateWithDetails) => {
    if (cert.verification_code) {
      const url = `${window.location.origin}/certificates/${cert.verification_code}`;
      if (navigator.share) {
        navigator.share({
          title: cert.metadata?.certificate_name || cert.training?.name || "Certificado",
          url,
        });
      } else {
        navigator.clipboard.writeText(url);
        toast.success("Link copiado para a área de transferência!");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total de Certificados</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
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
              <p className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</p>
              <p className="text-sm text-muted-foreground">Categorias</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar certificados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
                <SelectItem value="revoked">Revogados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">Nenhum certificado encontrado</h3>
          <p className="text-sm text-muted-foreground">
            {certificates.length === 0 
              ? "Complete treinamentos para ganhar certificados!"
              : "Ajuste os filtros para ver seus certificados."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CertificateCard
                certificate={cert}
                onView={() => handleView(cert)}
                onDownload={() => handleDownload(cert.id)}
                onShare={() => handleShare(cert)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <CertificateDetailModal
        certificate={selectedCertificate}
        isOpen={!!selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        onDownload={() => selectedCertificate && handleDownload(selectedCertificate.id)}
      />
    </motion.div>
  );
}
