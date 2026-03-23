import { Component, OnInit } from '@angular/core';

export interface MenuItem {
  label: string;
  hotkey: string; // The bold/underlined letter (e.g., 'C' for Create)
  route: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}