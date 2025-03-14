import type { Stack } from 'expo-router';
import type { NativeSyntheticEvent, TextInputSubmitEditingEventData } from 'react-native';
import type { SearchBarCommands } from 'react-native-screens';

type NativeStackNavigationOptions = Exclude<
  NonNullable<React.ComponentPropsWithoutRef<typeof Stack.Screen>['options']>,
  (props: any) => any
>;

type ScreenOptions = Pick<
  NativeStackNavigationOptions,
  | 'animation'
  | 'animationDuration'
  | 'contentStyle'
  | 'navigationBarColor'
  | 'animationTypeForReplace'
  | 'autoHideHomeIndicator'
  | 'gestureEnabled'
  | 'freezeOnBlur'
  | 'fullScreenGestureEnabled'
  | 'gestureDirection'
  | 'navigationBarHidden'
  | 'orientation'
  | 'presentation'
  | 'statusBarTranslucent'
  | 'statusBarStyle'
  | 'statusBarHidden'
  | 'statusBarAnimation'
  | 'title'
>;


type HeaderOptions = Omit<NativeStackNavigationOptions, keyof ScreenOptions>;

type NativeStackNavigationSearchBarOptions = NonNullable<HeaderOptions['headerSearchBarOptions']>;

type AdaptiveSearchBarRef = Omit<SearchBarCommands, 'blur' | 'toggleCancelButton'>;

type AdaptiveSearchHeaderProps = {
  /**
   * Default is false
   */
  iosIsLargeTitle?: boolean;
  iosBackButtonMenuEnabled?: boolean;
  iosBackButtonTitle?: string;
  iosBackButtonTitleVisible?: boolean;
  iosBackVisible?: boolean;
  /**
   * Default is 'systemMaterial'
   */
  iosBlurEffect?: HeaderOptions['headerBlurEffect'] | 'none';
  iosTitle?: string;
  /**
   * Default is true
   */
  materialUseSafeAreaTop?: boolean;
  /**
   * iOS - iosBlurEffect must be set to 'none' for this to work
   * @default iOS: true | Material: false
   */
  shadowVisible?: boolean;
  leftView?: HeaderOptions['headerLeft'];
  rightView?: HeaderOptions['headerRight'];
  shown?: boolean;
  backgroundColor?: string;
  screen?: ScreenOptions;
  searchBar?: {
    iosCancelButtonText?: string;
    iosHideWhenScrolling?: boolean;
    iosTintColor?: string;
    materialRightView?: HeaderOptions['headerRight'];
    materialBlurOnSubmit?: boolean;
    materialOnSubmitEditing?:
    | ((e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void)
    | undefined;
    autoCapitalize?: NativeStackNavigationSearchBarOptions['autoCapitalize'];
    inputType?: NativeStackNavigationSearchBarOptions['inputType'];
    onBlur?: () => void;
    onCancelButtonPress?: () => void;
    onChangeText?: (text: string) => void;
    onFocus?: () => void;
    onSearchButtonPress?: () => void;
    placeholder?: string;
    ref?: React.RefObject<AdaptiveSearchBarRef>;
    textColor?: string;
    content?: React.ReactNode;
  };
};

export type {
  NativeStackNavigationOptions,
  AdaptiveSearchBarRef,
  AdaptiveSearchHeaderProps,
  NativeStackNavigationSearchBarOptions,
};
