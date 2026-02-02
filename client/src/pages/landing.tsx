import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Database, Layout } from "lucide-react";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">TechCatalog</span>
          </div>
          <Button onClick={handleLogin} variant="outline" className="font-medium">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Now ready for enterprise migration
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-display font-bold text-slate-900 leading-tight">
              Master your <span className="text-blue-600">Technology</span> Landscape
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              Centralize, review, and approve your organization's technology catalog. 
              Transition from spreadsheets to a robust, Azure-ready approval workflow.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleLogin} size="lg" className="h-14 px-8 text-lg rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="pt-8 border-t border-slate-100 grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-2xl text-slate-900">100%</h4>
                <p className="text-slate-500">Azure SQL Ready</p>
              </div>
              <div>
                <h4 className="font-bold text-2xl text-slate-900">One-Click</h4>
                <p className="text-slate-500">SharePoint Migration</p>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in delay-200 lg:h-[600px] flex items-center justify-center">
            {/* Abstract visual representation of dashboard */}
            <div className="relative w-full aspect-square max-w-[500px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full blur-3xl opacity-60"></div>
              <div className="relative z-10 grid grid-cols-2 gap-4 p-4">
                <div className="col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-slate-100 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Database className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Technology Catalog</h3>
                            <p className="text-sm text-slate-500">243 Items Processed</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-3/4 rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Migration Progress</span>
                            <span>75%</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 transform -rotate-2 hover:rotate-0 transition-transform duration-500 translate-y-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
                    <h3 className="font-bold text-slate-900">Approvals</h3>
                    <p className="text-sm text-slate-500 mt-1">Streamlined team leader reviews</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 transform rotate-3 hover:rotate-0 transition-transform duration-500 translate-y-8">
                     <Layout className="w-8 h-8 text-indigo-500 mb-3" />
                    <h3 className="font-bold text-slate-900">Dashboard</h3>
                    <p className="text-sm text-slate-500 mt-1">Real-time status tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
