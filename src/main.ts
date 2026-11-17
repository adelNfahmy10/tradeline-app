import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// import function to register Swiper custom elements
import { register } from 'swiper/element/bundle';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { importProvidersFrom } from '@angular/core';
import { loadingInterceptor } from './core/interceptors/loading/loading-interceptor';
import { slidePageAnimation } from './core/slide.animation';

// register Swiper custom elements
register();

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(withFetch(), withInterceptors([loadingInterceptor])),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAnimations(),

    provideToastr({
      positionClass: 'toast-top-center',
      timeOut: 3000,
      closeButton: true,
      progressBar: false,
      newestOnTop: true,
      preventDuplicates: true,
      tapToDismiss: true,
      easeTime: 250,
      extendedTimeOut: 1000,
    }),
    importProvidersFrom(NgxSpinnerModule),
  ],
});
