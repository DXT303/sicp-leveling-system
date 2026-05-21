export const id = '002_projects_add_fields';

export const up = [
  `ALTER TABLE projects ADD COLUMN instrument   TEXT`,
  `ALTER TABLE projects ADD COLUMN bm_elevation TEXT`,
  `ALTER TABLE projects ADD COLUMN method       TEXT`,
  `ALTER TABLE projects ADD COLUMN distance_k   TEXT`,
];
