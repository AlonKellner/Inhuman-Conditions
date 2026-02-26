/**
 * InvestigatorCards Component
 * Flippable card interface for investigator showing:
 * - Cover Sheet
 * - Interleaved Primary/Secondary questions
 */

import { type FC, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Mousewheel } from 'swiper/modules';
import type { Packet } from '../../types/packet';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './InvestigatorCards.module.css';

interface InvestigatorCardsProps {
  packet: Packet;
}

export const InvestigatorCards: FC<InvestigatorCardsProps> = ({ packet }) => {
  // Interleave questions: Primary 1, Secondary 1, Primary 2, Secondary 2, Primary 3, Secondary 3
  const cards = useMemo(() => {
    const cardsList: Array<{ type: 'cover' | 'primary' | 'secondary'; image: string; label: string }> = [];

    // Cover sheet first
    cardsList.push({
      type: 'cover',
      image: packet.coverSheetImage,
      label: 'Cover Sheet',
    });

    // Separate primary and secondary questions
    const primaryQuestions = packet.questions.filter(q => q.type === 'primary');
    const secondaryQuestions = packet.questions.filter(q => q.type === 'secondary');

    // Interleave them
    for (let i = 0; i < 3; i++) {
      if (primaryQuestions[i]) {
        cardsList.push({
          type: 'primary',
          image: primaryQuestions[i].cardImage,
          label: `Primary Question ${i + 1}`,
        });
      }
      if (secondaryQuestions[i]) {
        cardsList.push({
          type: 'secondary',
          image: secondaryQuestions[i].cardImage,
          label: `Secondary Question ${i + 1}`,
        });
      }
    }

    return cardsList;
  }, [packet]);

  return (
    <div className={styles.container}>
      <Swiper
        modules={[Navigation, Pagination, Keyboard, Mousewheel]}
        navigation
        pagination={{
          type: 'fraction',
          formatFractionCurrent: (number) => number,
          formatFractionTotal: (number) => number,
        }}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        mousewheel={{
          forceToAxis: true,
          sensitivity: 0.5,
        }}
        spaceBetween={20}
        slidesPerView={1}
        loop={false}
        className={styles.swiper}
      >
        {cards.map((card, index) => (
          <SwiperSlide key={`${card.type}-${index}`} className={styles.swiperSlide}>
            <div className={styles.cardContent}>
              <div className={styles.cardImageContainer}>
                <img
                  src={card.image}
                  alt={card.label}
                  className={styles.cardImage}
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
