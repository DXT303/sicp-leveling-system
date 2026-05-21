export const id = '004_leveling_rows_index';

export const up = [
  // Index for fast per-project row lookups (used by GET /api/projects/:id/rows)
  `CREATE INDEX IF NOT EXISTS idx_leveling_rows_project_id
     ON leveling_rows (project_id, row_order)`,

  // Index for fast per-project calibration lookups
  `CREATE INDEX IF NOT EXISTS idx_calibrations_project_id
     ON calibrations (project_id)`,
];
