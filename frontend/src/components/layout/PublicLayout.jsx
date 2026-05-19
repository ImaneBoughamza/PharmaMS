import styles from "./PublicLayout.module.css";

export default function PublicLayout({ children }) {
  return (
    <div className={styles.root}>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

PublicLayout.getLayout = function getLayout(page) {
  return <PublicLayout>{page}</PublicLayout>;
};
