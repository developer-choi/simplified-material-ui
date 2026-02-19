import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
import generateUtilityClass from '@mui/utils/generateUtilityClass';

export interface SpeedDialIconClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the icon component. */
  icon: string;
  /** Styles applied to the icon component if `open={true}`. */
  iconOpen: string;
}

export type SpeedDialIconClassKey = keyof SpeedDialIconClasses;

export function getSpeedDialIconUtilityClass(slot: string): string {
  return generateUtilityClass('MuiSpeedDialIcon', slot);
}

const speedDialIconClasses: SpeedDialIconClasses = generateUtilityClasses('MuiSpeedDialIcon', [
  'root',
  'icon',
  'iconOpen',
]);

export default speedDialIconClasses;
