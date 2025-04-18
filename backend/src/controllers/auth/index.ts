
import { registerController } from './register.controller';
import { loginController } from './login.controller';
import { refreshController } from './refresh.controller';
import { logoutController } from './logout.controller';
import { meController } from './me.controller';

export const AuthController = {
  register: registerController,
  login: loginController,
  refresh: refreshController,
  logout: logoutController,
  me: meController,
};

export default AuthController;
