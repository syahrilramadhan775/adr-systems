const Joi = require('joi');
const { POSITIONS, DEPARTMENTS, UPDATABLE_STATUSES } = require('../../domain/constants');

const idParam = Joi.object({ id: Joi.number().integer().positive().required() });
const login = Joi.object({
  email: Joi.string()
  .trim()
  .email({ tlds: { allow: false } })
  .max(255)
  .required(),
  password: Joi.string().min(1).max(200).required()
}).unknown(false);

const userCreate = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string()
  .trim()
  .email({ tlds: { allow: false } })
  .max(255)
  .required(),
  password: Joi.string().min(10).max(100).required(),
  position: Joi.string().valid(...POSITIONS).required(),
  department: Joi.string().valid(...DEPARTMENTS).required()
}).unknown(false);

const userUpdate = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  email: Joi.string().trim().email().max(255),
  password: Joi.string().min(10).max(100),
  position: Joi.string().valid(...POSITIONS),
  department: Joi.string().valid(...DEPARTMENTS)
}).min(1).unknown(false);

const decisionCreate = Joi.object({
  cve: Joi.string().trim().min(2).max(80).required(),
  title: Joi.string().trim().min(3).max(240).required(),
  context: Joi.string().trim().min(1).max(20000).required(),
  decision: Joi.string().trim().min(1).max(20000).required(),
  consequences: Joi.string().trim().min(1).max(20000).required(),
  alternatives: Joi.string().trim().min(1).max(20000).required(),
  historyDescription: Joi.string().trim().min(1).max(50000).required()
}).unknown(false);

const decisionUpdate = Joi.object({
  cve: Joi.string().trim().min(2).max(80),
  title: Joi.string().trim().min(3).max(240),
  context: Joi.string().trim().min(1).max(20000),
  decision: Joi.string().trim().min(1).max(20000),
  consequences: Joi.string().trim().min(1).max(20000),
  alternatives: Joi.string().trim().min(1).max(20000),
  historyDescription: Joi.string().trim().min(1).max(50000)
}).min(1).unknown(false);

const statusUpdate = Joi.object({
  status: Joi.string().valid(...UPDATABLE_STATUSES).required()
}).unknown(false);

module.exports = { idParam, login, userCreate, userUpdate, decisionCreate, decisionUpdate, statusUpdate };
