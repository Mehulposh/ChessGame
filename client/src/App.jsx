import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/socketContext.jsx';
import Home from './pages/Home';
import Game from './pages/Game';

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/game/:roomId"  element={<Game />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}