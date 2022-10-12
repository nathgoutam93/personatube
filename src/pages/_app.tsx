import dynamic from "next/dynamic";
import type { AppProps } from "next/app";
import { Amplify } from "aws-amplify";
import config from "../aws-exports";
import UserProvider from "../context/userContext";
const Header = dynamic(() => import("../components/header"), { ssr: false });

import "../style.css";

Amplify.configure(config);

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </>
  );
}
