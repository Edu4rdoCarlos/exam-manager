import { GraduationCap, FileText, ClipboardCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass: string;
}

function FeatureItem({ icon: Icon, title, description, colorClass }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-border/50">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

const features: FeatureItemProps[] = [
  {
    icon: FileText,
    title: "Gestão de Provas",
    description: "Crie e gerencie provas com múltiplas versões e gabaritos.",
    colorClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    icon: ClipboardCheck,
    title: "Correção Automatizada",
    description: "Corrija respostas de alunos com histórico completo de alterações.",
    colorClass: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Users,
    title: "Gestão de Alunos",
    description: "Acompanhe o desempenho e registre resultados por turma.",
    colorClass: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
  },
];

export function LoginInfoPanel() {
  return (
    <div className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Exam Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              Sistema de Gerenciamento de Provas
            </p>
          </div>
        </div>

        <div className="space-y-6 mt-16">
          <h2 className="text-4xl font-bold leading-tight text-foreground">
            Gestão de Provas com
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Eficiência e Controle
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-md">
            Plataforma completa para criação, aplicação e correção de provas
            acadêmicas com rastreabilidade e histórico de alterações.
          </p>

          <div className="grid gap-4 mt-12">
            {features.map((feature) => (
              <FeatureItem key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-xs text-muted-foreground">
          © 2025 Exam Manager. Sistema acadêmico.
        </p>
      </div>
    </div>
  );
}
