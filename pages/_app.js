import "../styles/globals.css";
import { Urbanist } from "next/font/google";

//interal import
import { NavBar, Footer } from "../Components";
import { MultiContractProvider } from '../Context/MultiContractContext';

const urbanist = Urbanist({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  return (
    <>
      <MultiContractProvider>
        <main className={urbanist.className}>
          <NavBar/>
          <Component {...pageProps} />
          <Footer/>
        </main>
      </MultiContractProvider>
    </>
  );
}
