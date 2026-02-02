import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Catalog from "@/pages/catalog";
import ItemDetail from "@/pages/item-detail";
import Categories from "@/pages/categories";
import Import from "@/pages/import";
import MyReviews from "@/pages/my-reviews";
import ReviewCycles from "@/pages/review-cycles";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Switch>
      <Route path="/">
        {user ? <Dashboard /> : <LandingPage />}
      </Route>
      
      <Route path="/dashboard">
        {() => <PrivateRoute component={Dashboard} />}
      </Route>
      
      <Route path="/catalog">
        {() => <PrivateRoute component={Catalog} />}
      </Route>

      <Route path="/catalog/:id">
        {() => <PrivateRoute component={ItemDetail} />}
      </Route>

      <Route path="/categories">
        {() => <PrivateRoute component={Categories} />}
      </Route>

      <Route path="/import">
        {() => <PrivateRoute component={Import} />}
      </Route>

      <Route path="/my-reviews">
        {() => <PrivateRoute component={MyReviews} />}
      </Route>

      <Route path="/review-cycles">
        {() => <PrivateRoute component={ReviewCycles} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
