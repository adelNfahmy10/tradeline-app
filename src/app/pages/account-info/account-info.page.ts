import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonList,
  IonButton,
  IonButtons,
  IonBackButton,
  IonFooter,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/core/services/auth/auth-service';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.page.html',
  styleUrls: ['./account-info.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonList,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonButtons,
    IonBackButton,
    TabsComponent,
    IonFooter,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AccountInfoPage implements OnInit {
  private readonly _AuthService = inject(AuthService);
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  userData: any;
  userToken: string | null = localStorage.getItem('tradelineToken');
  editMode: boolean = false;

  ngOnInit(): void {
    if (this.userToken) {
      this.userInfo();
    }
  }

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  userInfo(): void {
    this._AuthService.getUserInfo(this.userToken!).subscribe({
      next: (res) => {
        this.userData = res;
        this.infoForm.patchValue(res);
      },
    });
  }

  infoForm: FormGroup = this._FormBuilder.group({
    id: [''],
    firstname: [''],
    lastname: [''],
    email: [''],
    phone: [''],
    address: [''],
    address2: [''],
    billing_address: [''],
    city: [''],
    password: [''],
  });

  toggleEdit(): void {
    this.editMode = true;
  }

  submitUpdate(): void {
    this.editMode = false;
  }
}
