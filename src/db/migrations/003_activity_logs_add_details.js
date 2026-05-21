export const id = '003_activity_logs_add_details';

export const up = [
  `ALTER TABLE activity_logs ADD COLUMN details TEXT`,
];
