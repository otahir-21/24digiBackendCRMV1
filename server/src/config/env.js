require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  recoveryAi: {
    baseUrl: process.env.RECOVERY_AI_URL || 'http://localhost:8000',
  },
};

module.exports = env;

