import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonFooter,
  IonRefresherContent,
  IonRefresher,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CallBackService } from 'src/core/services/callback/call-back-service';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.page.html',
  styleUrls: ['./callback.page.scss'],
  standalone: true,
  imports: [
    IonRefresher,
    IonRefresherContent,
    IonFooter,
    IonButtons,
    IonBackButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    ReactiveFormsModule,
    TabsComponent,
  ],
})
export class CallbackPage {
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _CallbackService = inject(CallBackService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);
  private readonly _Router = inject(Router);

  callbackForm: FormGroup = this._FormBuilder.group({
    description: ['', Validators.required],
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern('^[0-9+ ]{8,15}$')]],
    email: ['', [Validators.required, Validators.email]],
    serial: ['', Validators.required],
    details: ['', Validators.required],
  });

  submitCallbackForm(): void {
    if (this.callbackForm.invalid) return;

    this._CallbackService.sendCallback(this.callbackForm.value).subscribe({
      next: (res) => {
        this._Router.navigate(['/home']);
      },
    });
  }

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
