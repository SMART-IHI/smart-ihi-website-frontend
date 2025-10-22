import { Swiper, SwiperSlide } from "swiper/react";
// import styles from "./Banner.module.css";

export default function Banner() {
  return (
    <Swiper spaceBetween={0} slidesPerView={1} autoplay={{ delay: 4000 }} loop>
      <SwiperSlide>
        <div className="flex h-[400px] items-center justify-center bg-[url('/images/banner1.jpg')] bg-cover bg-center text-3xl font-serif text-white">
          Pioneering Human Immunology Research
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="flex h-[400px] items-center justify-center bg-[url('/images/banner2.jpg')] bg-cover bg-center text-3xl font-serif text-white">
          Exploring Cutting-edge Therapies
        </div>
      </SwiperSlide>
    </Swiper>

//<SwiperSlide>
//  <div className={styles.banner-slide} style={{ backgroundImage: "url('/images/banner1.jpg')" }}>
//    Pioneering Human Immunology Research
//  </div>
//</SwiperSlide>
  );
}
