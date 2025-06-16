import { Switch, Route } from "wouter";
import { queryClient } from "../shared/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster, TooltipProvider, Layout } from "../shared";
import { Dashboard } from "../features/dashboard";
import { BudgetsNew } from "../features/budgets";
import NotFound from "./not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/budgets" component={BudgetsNew} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
