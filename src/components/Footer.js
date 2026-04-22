import React from 'react';

export default function Footer() {
  return (
    <footer className="footer no-print">
      <p className="footer-role">
        Desenvolvido por <strong>Renan Willian</strong>
      </p>
      <p className="footer-copy">
        &copy; {new Date().getFullYear()} Zalio. Todos os direitos reservados.
      </p>
    </footer>
  );
}