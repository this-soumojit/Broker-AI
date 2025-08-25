import dotenv from "dotenv";

dotenv.config();

const {
  NODE_ENV = "development",
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM_EMAIL,
  SMTP_FROM_NAME,
  SMTP_SECURE = "false",
  JWT_SECRET,
  ALLOWED_ORIGINS,
  SWAGGER_HOST,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_NUMBER,
  OPENAI_API_KEY,
  WHATSAPP_PHONE_ID,
  WHATSAPP_API_TOKEN
} = process.env;

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

if (!WHATSAPP_API_TOKEN) {
  throw new Error("WHATSAPP_API_TOKEN is not set");
}

if (!WHATSAPP_PHONE_ID) {
  throw new Error("WHATSAPP_PHONE_ID is not set");
}

if (!DB_HOST) {
  throw new Error("DB_HOST is not set");
}

if (!DB_PORT) {
  throw new Error("DB_PORT is not set");
}

if (!DB_USER) {
  throw new Error("DB_USER is not set");
}

if (!DB_PASSWORD) {
  throw new Error("DB_PASSWORD is not set");
}

if (!DB_NAME) {
  throw new Error("DB_NAME is not set");
}

if (!SMTP_HOST) {
  throw new Error("SMTP_HOST is not set");
}

if (!SMTP_PORT) {
  throw new Error("SMTP_PORT is not set");
}

if (!SMTP_USER) {
  throw new Error("SMTP_USER is not set");
}

if (!SMTP_PASSWORD) {
  throw new Error("SMTP_PASSWORD is not set");
}

if (!SMTP_FROM_EMAIL) {
  throw new Error("SMTP_FROM_EMAIL is not set");
}

if (!SMTP_FROM_NAME) {
  throw new Error("SMTP_FROM_NAME is not set");
}

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

if (!ALLOWED_ORIGINS) {
  throw new Error("ALLOWED_ORIGINS is not set");
}

if (!SWAGGER_HOST) {
  throw new Error("SWAGGER_HOST is not set");
}

const config = {
  NODE_ENV,
  DB: {
    HOST: DB_HOST,
    PORT: DB_PORT,
    USER: DB_USER,
    PASSWORD: DB_PASSWORD,
    NAME: DB_NAME,
  },
  SMTP: {
    HOST: SMTP_HOST,
    PORT: SMTP_PORT,
    USER: SMTP_USER,
    PASSWORD: SMTP_PASSWORD,
    FROM_EMAIL: SMTP_FROM_EMAIL,
    FROM_NAME: SMTP_FROM_NAME,
    SECURE: SMTP_SECURE,
  },
  JWT: {
    SECRET: JWT_SECRET,
  },
  TWILIO: {
    ACCOUNT_SID: TWILIO_ACCOUNT_SID,
    AUTH_TOKEN: TWILIO_AUTH_TOKEN,
    PHONE_NUMBER: TWILIO_WHATSAPP_NUMBER,
  },
  ALLOWED_ORIGINS,
  SWAGGER: {
    HOST: SWAGGER_HOST,
  },
  WHATSAPP: {
    API_TOKEN: WHATSAPP_API_TOKEN,
    PHONE_ID: WHATSAPP_PHONE_ID
  }
};

export default config;
