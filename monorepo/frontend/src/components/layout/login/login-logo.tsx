import { GraduationCap } from "lucide-react";

export function LoginLogo() {
  return (
    <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
        <GraduationCap className="h-7 w-7 text-white" />
      </div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Exam Manager
      </h1>
    </div>
  );
}
