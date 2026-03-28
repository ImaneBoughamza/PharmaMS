import styles from "./PublicLayout.module.css";

export default function PublicLayout({ children }) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.logo}>PharmaOS</span>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

PublicLayout.getLayout = function getLayout(page) {
  return <PublicLayout>{page}</PublicLayout>;
};
