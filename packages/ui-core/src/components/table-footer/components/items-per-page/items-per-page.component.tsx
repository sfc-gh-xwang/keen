import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { transparentize } from 'polished';
import { AnimatePresence, MotionProps } from 'framer-motion';

import { BodyText } from '@keen.io/typography';
import { colors } from '@keen.io/colors';
import { Icon } from '@keen.io/icons';
import {
  useOnClickOutside,
  useKeypress,
  useDynamicContentPosition,
} from '@keen.io/react-hooks';

import DynamicPortal from '../../../dynamic-portal';
import {
  Container,
  Label,
  List,
  ListItem,
  IconContainer,
} from './items-per-page.styles';
import { PerPageType } from '../../types';
import { PER_PAGE_OPTIONS as Options } from '../../constants';
import { KEYBOARD_KEYS } from '../../../../constants';

type Props = {
  /** Default option */
  value?: PerPageType;
  /** Change event handler */
  onChange: (option: PerPageType) => void;
};

const listMotion: MotionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 2 },
  exit: { opacity: 0, y: 30 },
};

const ItemsPerPage: FC<Props> = ({ value = Options[0], onChange }) => {
  const containerRef = useRef(null);
  const [isOpen, setOpen] = useState(false);
  const [selectionIndex, setIndex] = useState<number>(null);

  useOnClickOutside(containerRef, () => setOpen(false));
  const { setPosition, contentPosition } = useDynamicContentPosition(
    containerRef
  );

  const { x, y, width } = contentPosition;

  useEffect(() => {
    if (isOpen) {
      const index = Options.findIndex((option) => value === option);
      setIndex(index);
    }
    return () => {
      setIndex(null);
    };
  }, [isOpen, value]);

  const keyboardHandler = useCallback(
    (_e: KeyboardEvent, keyCode: number) => {
      switch (keyCode) {
        case KEYBOARD_KEYS.ENTER:
          const value = Options[selectionIndex];
          onChange(value);
          setOpen(false);
          break;
        case KEYBOARD_KEYS.UP:
          if (selectionIndex > 0) {
            setIndex(selectionIndex - 1);
          }
          break;
        case KEYBOARD_KEYS.DOWN:
          if (selectionIndex === null) {
            setIndex(0);
          } else if (selectionIndex < Options.length - 1) {
            setIndex(selectionIndex + 1);
          }
          break;
        case KEYBOARD_KEYS.ESCAPE:
          setOpen(false);
          break;
      }
    },
    [selectionIndex, onChange]
  );

  useKeypress({
    keyboardAction: keyboardHandler,
    handledKeys: [
      KEYBOARD_KEYS.ENTER,
      KEYBOARD_KEYS.ESCAPE,
      KEYBOARD_KEYS.UP,
      KEYBOARD_KEYS.DOWN,
    ],
    addEventListenerCondition: isOpen,
    eventListenerDependencies: [selectionIndex, isOpen],
  });

  return (
    <Container
      ref={containerRef}
      role="button"
      tabIndex={0}
      onMouseEnter={() => {
        setPosition();
      }}
      onKeyDown={(e) => {
        if (e.keyCode === KEYBOARD_KEYS.ENTER) {
          setOpen(!isOpen);
        }
      }}
    >
      <Label onClick={() => setOpen(!isOpen)} isOpen={isOpen}>
        <BodyText variant="body2" color={colors.blue[500]}>
          {value} per page
        </BodyText>
        <IconContainer animate={{ rotate: isOpen ? 180 : 0 }}>
          <Icon
            type="caret-down"
            fill={transparentize(0.3, colors.blue[500])}
            width={10}
            height={10}
          />
        </IconContainer>
      </Label>
      <DynamicPortal>
        <AnimatePresence>
          {isOpen && (
            <List {...listMotion} x={x} y={y} width={width}>
              {Options.map((option) => (
                <ListItem
                  key={`${option}-per-page`}
                  isActive={option === Options[selectionIndex]}
                  whileHover={{
                    backgroundColor: transparentize(0.85, colors.blue[100]),
                  }}
                  onClick={() => {
                    setOpen(false);
                    onChange(option);
                  }}
                >
                  <BodyText variant="body2" color={colors.blue[500]}>
                    {option} per page
                  </BodyText>
                </ListItem>
              ))}
            </List>
          )}
        </AnimatePresence>
      </DynamicPortal>
    </Container>
  );
};

export default ItemsPerPage;
