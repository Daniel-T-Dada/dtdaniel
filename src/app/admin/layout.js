"use client";

import NotificationManager from "@/components/NotificationManager";

export default function AdminLayout({ children }) {
  return (
    <>
      <NotificationManager />
      {children}
    </>
  );
}
