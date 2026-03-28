import "../styles/globals.css";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      {getLayout(<Component {...pageProps} />)}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
