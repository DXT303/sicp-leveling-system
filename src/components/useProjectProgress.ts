// Hook to calculate and update project progress based on milestones
export async function calculateProjectProgress(projectId: number): Promise<number> {
  try {
    // Check if project has leveling rows (data input)
    const rowsRes = await fetch(`/api/projects/${projectId}/rows`);
    const rows = await rowsRes.json();
    const hasDataInput = rows.length > 0;

    // Check if project has computation results (check if rows have computed values)
    const hasComputation = rows.some((row: any) => 
      row.hi !== null || row.rise !== null || row.fall !== null || row.rl !== null
    );

    // Check if project has calibration
    const calibrationsRes = await fetch('/api/calibrations');
    const calibrations = await calibrationsRes.json();
    const hasCalibration = calibrations.some((cal: any) => cal.project_id === projectId);

    // Calculate progress based on milestones
    let progress = 0;
    
    if (hasDataInput) progress = 25;
    if (hasComputation) progress = 50;
    if (hasCalibration) progress = 75;
    
    // Note: 100% will be set manually when user exports/completes the project

    return progress;
  } catch (error) {
    console.error('Error calculating project progress:', error);
    return 0;
  }
}

export async function updateProjectProgress(projectId: number): Promise<void> {
  const progress = await calculateProjectProgress(projectId);
  
  await fetch(`/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress }),
  });
}
