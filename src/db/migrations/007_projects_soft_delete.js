export const id = '007_projects_soft_delete';

export const up = [
  `ALTER TABLE projects ADD COLUMN deleted_at TEXT`,
];
