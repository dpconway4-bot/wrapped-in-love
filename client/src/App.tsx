import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import AnchorPage from "@/pages/AnchorPage";
import DayPage from "@/pages/DayPage";
import JourneyPage from "@/pages/JourneyPage";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="grain-overlay" aria-hidden="true" />
      <Router hook={useHashLocation}>
        <Switch>
          <Route path="/" component={AnchorPage} />
          <Route path="/day/:day" component={DayPage} />
          <Route path="/journey" component={JourneyPage} />
          <Route component={NotFound} />
        </Switch>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
