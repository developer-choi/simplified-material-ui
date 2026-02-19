import generateUtilityClasses from '@mui/utils/generateUtilityClasses';

export interface SpeedDialIconClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the icon component. */
  icon: string;
  /** Styles applied to the icon component if `open={true}`. */
  iconOpen: string;
}

export type SpeedDialIconClassKey = keyof SpeedDialIconClasses;

const speedDialIconClasses: SpeedDialIconClasses = generateUtilityClasses('MuiSpeedDialIcon', [
  'root',
  'icon',
  'iconOpen',
]);

export default speedDialIconClasses;
