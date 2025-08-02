import "../styles/globals.css";

//interal import
import { NavBar, Footer } from "../Components";
import { MultiContractProvider } from '../Context/MultiContractContext';

export default function App({ Component, pageProps }) {
  return (
    <>
      <MultiContractProvider>
        <main className="font-sans">
          <NavBar/>
          <Component {...pageProps} />
          <Footer/>
        </main>
      </MultiContractProvider>
    </>
  );
}
