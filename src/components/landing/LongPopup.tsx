import React from 'react';
import styles from '../../styles/LongPopup.module.css';

interface LongPopupProps {
  icon: React.ReactNode;
  strokeColor: string;
  category: string;
  text: string;
}

const LongPopup: React.FC<LongPopupProps> = ({
  icon,
  strokeColor,
  category,
  text
}) => {
  return (
    <div className={styles.popupContainer}>
      <div 
        className={styles.popupContent}
        style={{ 
          borderColor: strokeColor,
          '--stroke-color': strokeColor
        } as React.CSSProperties}
      >
        <div className={styles.popupRow}>
          <span className={styles.iconWrapper} style={{ color: strokeColor }}>
            {icon}
          </span>
          <span className={styles.category} style={{ color: strokeColor }}>
            {category}:
          </span>
          <span className={styles.text}>
            {text}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LongPopup; 