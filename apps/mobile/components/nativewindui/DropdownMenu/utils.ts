import { DropdownItem, DropdownSubMenu } from './types';

function createDropdownSubMenu(
  subMenu: Omit<DropdownSubMenu, 'items'>,
  items: DropdownSubMenu['items']
) {
  return Object.assign(subMenu, { items }) as DropdownSubMenu;
}

function createDropdownItem(item: DropdownItem) {
  return item;
}

export { createDropdownSubMenu, createDropdownItem };
