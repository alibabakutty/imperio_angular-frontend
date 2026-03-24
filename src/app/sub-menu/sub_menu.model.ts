export interface SubMenuItem {
  label: string;
  hotkey: string;
  path: string;
  mode: 'create' | 'display' | 'alter';
}