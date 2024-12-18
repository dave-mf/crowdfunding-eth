import "../styles/globals.css";

//interal import
import { NavBar, Footer } from "../Components";
import {CrowdfundingProvider} from '../Context/CrowdFunding';

export default function App({ Component, pageProps }) {
  return (
    <>
      <CrowdfundingProvider>
        <NavBar/>
        <Component {...pageProps} />
        <Footer/>
      </CrowdfundingProvider>
    </>
  );
}
