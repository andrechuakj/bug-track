import React, { PropsWithChildren } from 'react';

const AppLayout = ({ children }: PropsWithChildren<unknown>) => {
  return (
    <div className="bg-yellow-50 h-screen">
      <header className="bg-blue-800 text-white p-4">Global Header</header>

      <main className="p-4">{children}</main>

      <footer className="bg-orange-500 text-white p-4 fixed bottom-0 w-full flex flex-row justify-center">
        <p>Global Footer</p>
      </footer>
    </div>
  );
};

export default AppLayout;
