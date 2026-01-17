
import { Category } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Potholes/Road Damage', icon: '🚧', active: true },
  { id: '2', name: 'Streetlights', icon: '💡', active: true },
  { id: '3', name: 'Trash/Graffiti', icon: '🧹', active: true },
  { id: '4', name: 'Sidewalks', icon: '🚶', active: true },
  { id: '5', name: 'Parks', icon: '🌳', active: true },
  { id: '6', name: 'Traffic Signals', icon: '🚦', active: true },
  { id: '7', name: 'Water/Drainage', icon: '💧', active: true },
  { id: '8', name: 'Safety Concern', icon: '⚠️', active: true },
  { id: '9', name: 'Other', icon: '📝', active: true },
];

export const APP_NAME = 'CivicPulse';
export const CITY_NAME = 'Los Altos';

export const TRENDING_WEIGHT_UPVOTES = 2;
export const TRENDING_RECENCY_DAYS = 7;
