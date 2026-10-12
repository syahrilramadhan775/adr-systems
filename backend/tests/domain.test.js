const test = require('node:test');
const assert = require('node:assert/strict');
const { POSITIONS, DEPARTMENTS, STATUSES, UPDATABLE_STATUSES } = require('../src/domain/constants');

test('position values only include lead, senior, staff', () => {
  assert.deepEqual(POSITIONS, ['lead', 'senior', 'staff']);
});

test('department values match the required whitelist', () => {
  assert.deepEqual(DEPARTMENTS, ['backend', 'frontend', 'unity', 'sqa', 'ld']);
});

test('new ADR statuses include pengajuan, while status updates only accept research/completed', () => {
  assert.deepEqual(STATUSES, ['pengajuan', 'research', 'completed']);
  assert.deepEqual(UPDATABLE_STATUSES, ['research', 'completed']);
});
