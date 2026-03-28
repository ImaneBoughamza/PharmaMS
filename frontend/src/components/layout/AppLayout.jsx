import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import styles from "@/styles/AppLayout.module.css";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.root}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.main}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

AppLayout.getLayout = function getLayout(page) {
  return <AppLayout>{page}</AppLayout>;
};
