/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useRef, useState, useContext, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Arc, DefaultArcObject } from 'd3-shape';

import { PieLabel } from '../../components';
import { StyledPath } from './donut-slice.styles';

import {
  createArcTween,
  animateArcPath,
  ArcProperties,
} from '../circular-chart';
import { ChartContext, ChartContextType } from '../../contexts';

const sliceTransition = { duration: 0.2, ease: 'easeInOut' };

const sliceVariants = {
  hidden: { opacity: 0 },
  remove: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      ease: 'easeInOut',
      delay: 0.5,
    },
  },
};

const activeVariants = {
  default: {
    opacity: 1,
    scale: 1,
  },
  initial: {
    opacity: 0,
    scale: 1,
  },
  inactive: {
    opacity: 0.2,
    scale: 1,
  },
  active: {
    opacity: 1,
    scale: 1.05,
  },
  offsetChange: {
    opacity: 1,
    transition: {
      delay: 0,
      duration: 0.5,
    },
  },
};

type Props = {
  draw: Arc<any, DefaultArcObject>;
  startAngle: number;
  endAngle: number;
  autocolor: boolean;
  labelPosition: [number, number];
  activePosition: [number, number];
  label: string | number | Date | boolean;
  background: string;
  id: string;
  activeKey?: string;
  onMouseMove: (e: React.MouseEvent<SVGGElement, MouseEvent>) => void;
  onMouseLeave: (e: React.MouseEvent<SVGGElement, MouseEvent>) => void;
  dataSeriesOffset?: [number, number];
};

const DonutSlice: FC<Props> = ({
  background,
  draw,
  autocolor,
  label,
  startAngle,
  endAngle,
  labelPosition,
  id,
  activeKey,
  onMouseLeave,
  onMouseMove,
  dataSeriesOffset,
}) => {
  const [initialDrawFinished, setInitialDraw] = useState(false);
  const [arcProperties, setArcProperties] = useState<ArcProperties>({
    startAngle,
    endAngle,
  });
  const element = useRef(null);
  const path = useRef(null);

  const [isDelayed, setDelay] = useState(false);
  const [isActive, setActive] = useState(false);

  const activeControls = useAnimation();
  const { theme } = useContext(ChartContext) as ChartContextType;
  const { labels } = theme.donut;
  const [labelX, labelY] = labelPosition;

  useEffect(() => {
    if (initialDrawFinished) {
      const motion = createArcTween(
        arcProperties,
        { startAngle, endAngle },
        draw
      );

      requestAnimationFrame(() => {
        animateArcPath(element, motion, () => {
          setArcProperties({
            startAngle,
            endAngle,
          });
        });
      });
      setDelay(true);
    }
  }, [startAngle, endAngle]);

  useEffect(() => {
    if (activeKey) {
      activeControls
        .start(
          activeKey === id ? activeVariants.active : activeVariants.inactive
        )
        .then(() => {
          setInitialDraw(true);
        });
    } else {
      activeControls
        .start(activeVariants.default, { delay: isDelayed ? 0.5 : 0 })
        .then(() => {
          if (isDelayed) {
            setDelay(false);
          }
        });
    }
  }, [activeKey, background]);

  useEffect(() => {
    activeControls.start(activeVariants.offsetChange);
  }, [dataSeriesOffset]);

  return (
    <motion.g
      variants={sliceVariants}
      initial="hidden"
      animate="show"
      exit="remove"
      data-testid={id}
    >
      <motion.g
        key={`slice-${background}`}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={(e) => {
          onMouseLeave(e);
          setActive(false);
        }}
        transition={sliceTransition}
        variants={activeVariants}
        animate={activeControls}
        initial={activeVariants.initial}
        whileHover={activeVariants.active}
        style={{ originX: '0', originY: '0' }}
        ref={path}
      >
        <StyledPath
          dropShadow={isActive}
          ref={element}
          d={draw(arcProperties as DefaultArcObject)}
          key={background}
          fill={background}
        />
        {labels.enabled && (
          <motion.g
            initial={false}
            animate={{ x: labelX, y: labelY }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <PieLabel
              sliceBackground={background}
              autocolor={autocolor}
              {...labels.typography}
            >
              {label}
            </PieLabel>
          </motion.g>
        )}
      </motion.g>
    </motion.g>
  );
};

export default DonutSlice;
