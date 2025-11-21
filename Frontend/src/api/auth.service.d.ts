interface RegisterResponse {
  token: string;
  username: string;
  message: string;
}

interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

interface ResetPasswordResponse {
  message: string;
}

interface UpdateProfileResponse {
  user: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  };
}

declare const authService: {
  register: (username: string, password: string, confirmPassword: string, firstName: string, lastName: string, email: string, phoneNumber?: string) => Promise<RegisterResponse>;
  login: (username: string, password: string) => Promise<{ token?: string; username?: string; firstName?: string; lastName?: string; email?: string }>;
  logout: () => void;
  getToken: () => string | null;
  verifyEmail: (token: string) => Promise<{ verified?: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<ResetPasswordResponse>;
  resetPassword: (email: string, resetCode: string, newPassword: string, confirmPassword: string) => Promise<ResetPasswordResponse>;
  forgotUsername: (email: string) => Promise<{username: string, message: string}>;
  updateProfile: (profileData: ProfileData) => Promise<UpdateProfileResponse>;
};
export default authService;

