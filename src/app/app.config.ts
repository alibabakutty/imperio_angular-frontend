import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),   // ✅ Makes :orderNumber available as an @Input
      withEnabledBlockingInitialNavigation(),    // ✅ CRITICAL: Stops the "NoMatch" refresh crash
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })  // ✅ Bonus: Fixes scroll on refresh
    ),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    // provideBrowserGlobalErrorListeners()
    
  ]
};
