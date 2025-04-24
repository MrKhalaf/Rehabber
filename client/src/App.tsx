import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Home from "@/pages/Home";
import ExerciseDetail from "@/pages/ExerciseDetail";
import Timer from "@/pages/Timer";
import AddExercise from "@/pages/AddExercise";
import EditExercise from "@/pages/EditExercise";
import History from "@/pages/History";
import Progress from "@/pages/Progress";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/exercise/:id" component={ExerciseDetail} />
      <Route path="/timer/:id" component={Timer} />
      <Route path="/add-exercise" component={AddExercise} />
      <Route path="/edit-exercise/:id" component={EditExercise} />
      {/* Implemented routes */}
      <Route path="/history" component={History} />
      <Route path="/progress" component={Progress} />
      {/* Future routes */}
      <Route path="/profile" component={() => <div className="p-8">User profile coming soon</div>} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
