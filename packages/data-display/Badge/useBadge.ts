'use client';
import * as React from 'react';
import usePreviousProps from '@mui/utils/usePreviousProps';
import { UseBadgeParameters, UseBadgeReturnValue } from './useBadge.types';

function useBadge(parameters: UseBadgeParameters): UseBadgeReturnValue {
  const {
    badgeContent: badgeContentProp,
    invisible: invisibleProp = false,
    showZero = false,
  } = parameters;

  const prevProps = usePreviousProps({
    badgeContent: badgeContentProp,
  });

  let invisible = invisibleProp;

  if (invisibleProp === false && badgeContentProp === 0 && !showZero) {
    invisible = true;
  }

  const { badgeContent } = invisible ? prevProps : parameters;

  const displayValue: React.ReactNode = badgeContent;

  return {
    badgeContent,
    invisible,
    displayValue,
  };
}

export default useBadge;
