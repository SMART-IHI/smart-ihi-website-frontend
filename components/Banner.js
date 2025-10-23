import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y, Keyboard, Mousewheel, Scrollbar } from "swiper/modules";
import { bannerImages } from "../lib/bannerImages";

export default function Banner({ items }) {
  const slides = Array.isArray(items) && items.length > 0 ? items : bannerImages;
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay, A11y, Keyboard, Mousewheel, Scrollbar]}
      spaceBetween={0}
      slidesPerView={1}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      loop
      navigation
      pagination={{ clickable: true }}
      keyboard={{ enabled: true }}
      mousewheel={{ forceToAxis: true }}
      scrollbar={{ draggable: true, hide: false }}
      a11y={{ enabled: true }}
    >
      {slides.map((b, idx) => (
        <SwiperSlide key={idx}>
          <div
            className="relative flex h-[400px] items-center justify-center bg-cover bg-center text-3xl font-serif text-white"
            style={{ backgroundImage: `url('${b.url}')` }}
            aria-label={b.alt}
            role="img"
          >
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 px-4 text-center drop-shadow-lg">
              {b.caption}
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
