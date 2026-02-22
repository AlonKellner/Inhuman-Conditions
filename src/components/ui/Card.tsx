import { type FC, type HTMLAttributes, type ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  children: ReactNode;
}

export const Card: FC<CardProps> = ({ title, children, className = '', ...props }) => {
  const cardClass = [styles.card, className].filter(Boolean).join(' ');

  return (
    <article className={cardClass} {...props}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.content}>{children}</div>
    </article>
  );
};
