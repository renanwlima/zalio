import React from 'react';
import { Capacitor } from '@capacitor/core';

export default function Footer() {
  return (
    <footer 
      className="footer no-print"
      style={{
        paddingBottom: Capacitor.isNativePlatform() ? 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' : '0.5rem'
      }}
    >
      <p className="footer-role">
        Desenvolvido por <strong>Renan Willian</strong>
      </p>
      <p className="footer-copy">
        &copy; {new Date().getFullYear()} Zalio. Todos os direitos reservados.
      </p>
    </footer>
  );
}