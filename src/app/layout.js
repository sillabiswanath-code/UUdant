import './globals.css';

import { GlobalProvider } from '@/context/GlobalState';

export const metadata = {
  title: 'UDANT — Agricultural First-Mile Logistics OS',
  description: 'Smart Logistics powered by DP World',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GlobalProvider>
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
