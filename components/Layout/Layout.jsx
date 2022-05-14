import React, { useEffect } from "react";
import { checkSolanaBrowser } from "../../utils/connects";

const Layout = ({ children }) => {
  useEffect(() => {
    checkSolanaBrowser();
  }, []);

  return (
    <div className="bg-slate-800 text-white min-h-screen max-w-screen">
      {children}
    </div>
  );
};

export default Layout;
