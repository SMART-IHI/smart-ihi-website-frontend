// pages/_app.js
import "../styles/globals.css";
import "swiper/css";            // Global CSS here
import "swiper/css/navigation"; // optional if you use swiper navigation
import "swiper/css/pagination"; // optional if you use pagination
import { appWithTranslation } from "next-i18next";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default appWithTranslation(MyApp);
