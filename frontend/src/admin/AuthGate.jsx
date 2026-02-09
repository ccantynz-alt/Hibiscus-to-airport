import React, { useEffect, useState } from "react";

export default function AuthGate({ children }) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("HIBI_ADMIN_TOKEN");
    setOk(!!t);
  }, []);

  if (!ok) {
    // If not authed, the router will send you to /admin/login
    return null;
  }
  return children;
}