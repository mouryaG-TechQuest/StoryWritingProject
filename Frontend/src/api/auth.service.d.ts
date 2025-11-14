declare const authService: {
  register: (username: string, password: string) => Promise<{ token?: string }>;
  login: (username: string, password: string) => Promise<{ token?: string }>;
  logout: () => void;
  getToken: () => string | null;
};
export default authService;

