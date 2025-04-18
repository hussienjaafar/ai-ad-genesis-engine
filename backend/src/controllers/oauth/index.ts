
import { MetaOAuthController } from './metaController';
import { GoogleOAuthController } from './googleController';

export const OAuthController = {
  metaInit: MetaOAuthController.init,
  metaCallback: MetaOAuthController.callback,
  googleInit: GoogleOAuthController.init,
  googleCallback: GoogleOAuthController.callback,
};

export default OAuthController;
