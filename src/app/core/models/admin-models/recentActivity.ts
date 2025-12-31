

export interface RecentActivity {
  action: string;
  time: string;
  type: 'order' | 'currentStock' | 'user' | 'system';
  timestamp: number;
}