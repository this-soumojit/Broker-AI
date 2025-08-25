import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import Index from "@/pages";

function App() {
  return (
    <BrowserRouter>
      <Index />
      <Toaster position="top-right" richColors duration={3000} theme="light" />
    </BrowserRouter>
  );
}

export default App;
