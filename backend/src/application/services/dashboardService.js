const dashboardRepository = require('../../infrastructure/repositories/dashboardRepository');

async function summary(userId) {
  const counts = await dashboardRepository.summary(userId);
  return {
    completed: Number(counts.completed),
    pengajuan: Number(counts.pengajuan),
    research: Number(counts.research),
    total: Number(counts.total)
  };
}

module.exports = { summary };
