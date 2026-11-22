import { CarritoProvider } from "./carrito/CarritoProvider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { WalletProvider } from "./wallet/WalletProvider";
import { ServiciosProvider } from "./arcadia/ServiciosProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <WalletProvider>
        <ServiciosProvider>
          <CarritoProvider>
            <App />
          </CarritoProvider>
        </ServiciosProvider>
      </WalletProvider>
    </BrowserRouter>
  </StrictMode>
);