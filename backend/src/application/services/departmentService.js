const departments = require('../../infrastructure/repositories/departmentRepository');

async function list() {
  return departments.list();
}

module.exports = { list };
