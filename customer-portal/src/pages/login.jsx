export default function CustomerPortalLoginRedirect() {
  return null;
}

export function getServerSideProps() {
  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
}
