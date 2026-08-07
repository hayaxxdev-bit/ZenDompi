export type LoginCommand = {
  telegramId: string;
  otp: string;
};

export type RegisterCommand = {
  telegramId: string;
  name?: string;
  whatsappNo?: string;
};

export type RequestOTPCommand = {
  telegramId: string;
};

export type AuthResult = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    telegramId: string | null;
    whatsappNo: string | null;
    image: string | null;
    role: string;
  };
  isNewUser: boolean;
};