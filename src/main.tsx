import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// import "./index.css"
import styles from "./index.css?inline"

import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { queryClient } from "@/lib/api.ts"
import { TooltipProvider } from "@/components/ui/tooltip.tsx"

// @ts-ignore
window.$ = window.jQuery = $;

const styleEl = document.createElement("style")
styleEl.textContent = styles
document.head.appendChild(styleEl)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>
)
