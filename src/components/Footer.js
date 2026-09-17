import React from 'react';
import { Capacitor } from '@capacitor/core';

export default function Footer() {
  return (
    <footer
      className="footer no-print"
      style={{
        paddingBottom: Capacitor.isNativePlatform() ? 'calc(0.2rem + env(safe-area-inset-bottom, 0px))' : '0.2rem',
        paddingTop: '0.2rem'
      }}
    >
      <span>
        Desenvolvido por <strong>Renan Willian</strong> • &copy; {new Date().getFullYear()} Zalio
      </span>
    </footer>
  );
}