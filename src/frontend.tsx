/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, LoginForm, AuthCallback, ProtectedRoute } from "./App";
import Chessboard from "./components/chessboard";

function start() {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/chessboard"
            element={
              <ProtectedRoute>
                <Chessboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/chessboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
