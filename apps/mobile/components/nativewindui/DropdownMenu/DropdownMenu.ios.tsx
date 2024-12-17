import * as React from 'react';
import { View } from 'react-native';
import {
  ContextMenuButton,
  MenuAttributes,
  MenuConfig,
  MenuElementConfig,
  OnPressMenuItemEvent,
} from 'react-native-ios-context-menu';

import type {
  DropdownItem,
  DropdownMenuConfig,
  DropdownMenuProps,
  DropdownMenuRef,
  DropdownSubMenu,
} from './types';

const DropdownMenu = React.forwardRef<DropdownMenuRef, DropdownMenuProps>(
  (
    {
      items,
      title,
      iOSItemSize = 'large',
      onItemPress,
      enabled = true,
      materialPortalHost: _materialPortalHost,
      materialSideOffset: _materialSideOffset,
      materialAlignOffset: _materialAlignOffset,
      materialAlign: _materialAlign,
      materialWidth: _materialWidth,
      materialMinWidth: _materialMinWidth,
      materialLoadingText: _materialLoadingText,
      materialSubMenuTitlePlaceholder: _materialSubMenuTitlePlaceholder,
      materialOverlayClassName: _materialOverlayClassName,
      ...props
    },
    ref
  ) => {
    return (
      <View>
        <ContextMenuButton
          ref={ref as React.LegacyRef<ContextMenuButton>}
          isMenuPrimaryAction
          isContextMenuEnabled={enabled}
          menuConfig={toConfigMenu(items, iOSItemSize, title)}
          onPressMenuItem={toOnPressMenuItem(onItemPress)}
          {...props}
        />
      </View>
    );
  }
);

DropdownMenu.displayName = 'DropdownMenu';

export { DropdownMenu };

function toOnPressMenuItem(onItemPress: DropdownMenuProps['onItemPress']): OnPressMenuItemEvent {
  return ({ nativeEvent, isUsingActionSheetFallback }) => {
    onItemPress?.(
      {
        actionKey: nativeEvent.actionKey,
        title: nativeEvent.actionTitle,
        subTitle: nativeEvent.actionSubtitle,
        state: nativeEvent.menuState ? { checked: nativeEvent.menuState === 'on' } : undefined,
        destructive: nativeEvent.menuAttributes?.includes('destructive'),
        disabled: nativeEvent.menuAttributes?.includes('disabled'),
        hidden: nativeEvent.menuAttributes?.includes('hidden'),
        keepOpenOnPress: nativeEvent.menuAttributes?.includes('keepsMenuPresented'),
        loading: false,
      },
      isUsingActionSheetFallback
    );
  };
}

function toConfigMenu(
  items: DropdownMenuConfig['items'],
  iOSItemSize: DropdownMenuConfig['iOSItemSize'],
  title: DropdownMenuConfig['title']
): MenuConfig {
  return {
    menuTitle: title ?? '',
    menuPreferredElementSize: iOSItemSize,
    menuItems: items.map((item) => {
      if ('items' in item) {
        return toConfigSubMenu(item);
      }
      return toConfigItem(item);
    }),
  };
}

function toConfigSubMenu(subMenu: DropdownSubMenu): MenuElementConfig {
  if (subMenu.loading) {
    return {
      type: 'deferred',
      deferredID: `${subMenu.title ?? ''}-${Date.now()}`,
    };
  }
  return {
    menuOptions: subMenu.iOSType === 'inline' ? ['displayInline'] : undefined,
    menuTitle: subMenu.title ?? '',
    menuSubtitle: subMenu.subTitle,
    menuPreferredElementSize: subMenu.iOSItemSize,
    menuItems: subMenu.items.map((item) => {
      if ('items' in item) {
        return toConfigSubMenu(item);
      }
      return toConfigItem(item);
    }),
  };
}

function toConfigItem(item: DropdownItem): MenuElementConfig {
  if (item.loading) {
    return {
      type: 'deferred',
      deferredID: `${item.actionKey}-deferred}`,
    };
  }
  const menuAttributes: MenuAttributes[] = [];
  if (item.destructive) {
    menuAttributes.push('destructive');
  }
  if (item.disabled) {
    menuAttributes.push('disabled');
  }
  if (item.hidden) {
    menuAttributes.push('hidden');
  }
  if (item.keepOpenOnPress) {
    menuAttributes.push('keepsMenuPresented');
  }
  return {
    actionKey: item.actionKey,
    actionTitle: item.title ?? '',
    actionSubtitle: item.subTitle,
    menuState: item.state?.checked ? 'on' : 'off',
    menuAttributes,
    discoverabilityTitle: item.subTitle,
    icon: item.icon as any
  };
}
