import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonSegmentButton,
  IonSegment,
  IonSegmentContent,
  IonSegmentView,
  IonItem,
  IonList,
  IonInput,
  IonInputPasswordToggle,
  IonButton,
  IonCheckbox,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/core/services/auth/auth-service';
import { CartService } from 'src/core/services/cart/cart-service';
import { Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { ToastrService } from 'ngx-toastr';
import { PointsService } from 'src/core/services/points/points-service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonInput,
    IonList,
    IonItem,
    IonSegment,
    IonSegmentButton,
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonSegmentContent,
    IonSegmentView,
    IonInputPasswordToggle,
    ReactiveFormsModule,
    IonCheckbox,
  ],
})
export class AuthPage {
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _AuthService = inject(AuthService);
  private readonly _CartService = inject(CartService);
  private readonly _PointsService = inject(PointsService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _Router = inject(Router);

  loginForm: FormGroup = this._FormBuilder.group({
    username: [null, Validators.required],
    password: [null, Validators.required],
    rememberMe: [false],
  });

  signupForm: FormGroup = this._FormBuilder.group({
    firstname: [null, Validators.required],
    lastname: [null, Validators.required],
    phone: [null, Validators.required],
    email: [null, Validators.required],
    password: [null, Validators.required],
    rePassword: [null, Validators.required],
  });

  forgetPasswordForm: FormGroup = this._FormBuilder.group({
    username: [null, Validators.required],
    code: [null, Validators.required],
    newPassword: [null, Validators.required],
    rePassword: [null, Validators.required],
  });

  @ViewChild(IonContent) ionContent!: IonContent;

  private scrollAuthToTop(): void {
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.ionContent?.scrollToTop(300);
      }, 150);
    });
  }
  /* Without User Points */
  submitLogin(): void {
    if (this.loginForm.invalid) return;

    const data = this.loginForm.value;

    this._AuthService
      .login(data)
      .pipe(
        // 1. خزّن توكن المستخدم
        tap((res: any) => {
          this._AuthService.setToken(res.token);
          Preferences.set({ key: 'tradelineToken', value: res.token });
          this._CartService.addCart();
        }),

        // 2. هات بيانات المستخدم
        switchMap((res: any) => this._AuthService.getUserInfo(res.token)),

        // 3. خزّن بيانات المستخدم
        tap((user: any) => {
          localStorage.setItem('userId', user.id);
          localStorage.setItem(
            'userName',
            `${user.firstname} ${user.lastname}`
          );
          localStorage.setItem('phone', user.phone);

          this._PointsService.getPointsToken().subscribe({
            next: (res) => {
              this._PointsService
                .getPoints(res.access_token, user.phone)
                .subscribe({
                  next: (res) => {
                    const pointsData = JSON.parse(res);
                    this._PointsService.pointsData.set(pointsData);
                    const pointsTotal = Number(pointsData.TotalPoints ?? 0);
                    localStorage.setItem(
                      'userTradelinePoints',
                      pointsTotal.toString()
                    );
                    this._PointsService.points.set(pointsTotal);
                  },
                });
            },
          });

          this._AuthService.userName.set(`${user.firstname} ${user.lastname}`);
        })
      )
      .subscribe({
        next: () => {
          this._ToastrService.success(
            `Welcome, ${localStorage.getItem('userName')}`,
            '',
            {
              timeOut: 3000,
              progressBar: true,
              progressAnimation: 'increasing',
              closeButton: true,
              tapToDismiss: true,
            }
          );
          
          // this._ToastrService.success(`Welcome, ${localStorage.getItem('userName')}`);

          this._Router.navigate(['/home']);
          this.loginForm.reset();
        },
        error: (err) => {
          console.error('Login flow failed', err);

          this._ToastrService.error(
            'Unable to sign in. Please check your credentials and try again.'
          );
        },
      });
  }

  submitSignup(): void {
    if (this.signupForm.invalid) return;
    const data = this.signupForm.value;

    this._AuthService
      .register(data)
      .pipe(
        // 1. خزّن التوكن
        tap((res: any) => {
          this._AuthService.setToken(res.token); // استخدم setToken بدل localStorage مباشرة
        }),
        // 2. هات بيانات المستخدم
        switchMap((res: any) => this._AuthService.getUserInfo(res.token)),
        // 3. خزّن بيانات المستخدم
        tap((user: any) => {
          localStorage.setItem('userId', user.id);
          localStorage.setItem(
            'userName',
            `${user.firstname} ${user.lastname}`
          );
          localStorage.setItem('phone', user.phone);
        })
      )
      .subscribe({
        next: () => {
          this._ToastrService.success(
            `Welcome, ${localStorage.getItem('userName')}`,
            '',
            {
              timeOut: 3000,
              progressBar: true,
              progressAnimation: 'increasing',
              closeButton: true,
              positionClass: 'toast-top-right',
              tapToDismiss: true,
            }
          );
          this._Router.navigate(['/tabs/explore']);
          this.signupForm.reset();
        },
        error: (err) => {
          console.error('Signup flow failed', err);
        },
      });
  }

  segmentChanged(event: any) {
    const value = event.detail.value;

    if (value === 'login') {
      this.loginForm.reset();
    } else if (value === 'SignUp') {
      this.signupForm.reset();
    }

    this.scrollAuthToTop();
  }

  ionViewWillEnter() {
    this.loginForm.reset();
    this.loginForm.markAsPristine();
    this.loginForm.markAsUntouched();
  }

  /* Forget Password */
  forgetStep = 0;
  loadingStep = false;

  openForgetPassword(): void {
    this.loadingStep = true;
    this.forgetStep = 1;

    // Reset الفورم عشان نبدأ Clean
    this.forgetPasswordForm.reset({
      username: '',
      code: '',
      newPassword: '',
      rePassword: '',
    });

    this.scrollAuthToTop();
  }

  submitForgetPassword(): void {
    if (this.forgetStep == 1) {
      /* 1️⃣ Send Email */
      if (this.forgetPasswordForm.value.username) {
        let email = {
          email: this.forgetPasswordForm.value.username,
        };

        this._AuthService.sendForgetEmail(email).subscribe({
          next: (res) => {
            this.forgetStep = 2;
            this._ToastrService.success('Success Email...');
            this.scrollAuthToTop();
          },
          error: (err) => {
            this._ToastrService.error(err.error.detail);
          },
        });
      }
    } else if (this.forgetStep == 2) {
      /* 2️⃣ Verify Code */
      if (this.forgetPasswordForm.value.code) {
        let code = this.forgetPasswordForm.value.code;
        this._AuthService.sendResetCode(code).subscribe({
          next: (res) => {
            this._ToastrService.success('Code is Successfully');
            this.forgetStep = 3;
            this.scrollAuthToTop();
          },
          error: (err) => {
            this._ToastrService.error(err.error.detail);
          },
        });
      }
    } else if (this.forgetStep == 3) {
      /* 3️⃣ Reset Password */
      if (
        this.forgetPasswordForm.value.newPassword &&
        this.forgetPasswordForm.value.rePassword &&
        this.forgetPasswordForm.value.newPassword ==
          this.forgetPasswordForm.value.rePassword
      ) {
        const data = {
          password_reset_code: this.forgetPasswordForm.value.code,
          password: this.forgetPasswordForm.value.newPassword,
        };

        this._AuthService.resetPass(data).subscribe({
          next: (res) => {
            this.forgetPasswordForm.reset();
            this.forgetStep = 0;
            this.loadingStep = false;
            this._ToastrService.success(
              'Change Password is successfully, You Can Login Now'
            );
            this.scrollAuthToTop();
          },
          error: (err) => {
            this._ToastrService.error(err.error.detail);
          },
        });
      }
    }
  }

  skipRoute(): void {
    if (this.forgetStep != 0) {
      this.forgetPasswordForm.reset();
      this.forgetStep = 0;
      this.loadingStep = false;
      this._Router.navigate(['/home']);
    } else {
      this._Router.navigate(['/home']);
    }
  }

  backToLogin(): void {
    this.forgetStep = 0;
  }

  /* Login With User Point */
  // submitLogin(): void {
  //   if (this.loginForm.invalid) return;

  //   const data = this.loginForm.value;

  //   this._AuthService.login(data).pipe(
  //   // 1. خزّن توكن المستخدم
  //   tap((res: any) => {
  //     localStorage.setItem("tradelineToken", res.token);
  //   }),

  //   // 2. هات بيانات المستخدم
  //   switchMap((res: any) => this._AuthService.getUserInfo(res.token)),

  //   // 3. خزّن بيانات المستخدم
  //   tap((user: any) => {
  //     localStorage.setItem("userId", user.id);
  //     localStorage.setItem("userName", `${user.firstname} ${user.lastname}`);
  //     localStorage.setItem("phone", user.phone);
  //   }),

  //   // 4. هات توكن النقاط
  //   switchMap(() => this._AuthService.getPointsToken()),

  //   // 5. استخدم توكن النقاط علشان تجيب النقاط
  //   switchMap((pointsRes: any) => {
  //     const tokenPoints = pointsRes.access_token;
  //     const phone = localStorage.getItem('phone');

  //     return this._AuthService.getPoints(tokenPoints, phone);
  //   }),

  //   // 6. خزّن النقاط
  //   tap((res: any) => {
  //     const p = typeof res === 'string' ? JSON.parse(res) : res;
  //       localStorage.setItem('points', p.Points ?? '0');
  //     })

  //   ).subscribe({
  //     next: () => {
  //       this._ToastrService.success(
  //         `Login successful, ${localStorage.getItem('userName')}`,
  //         '',
  //         {
  //           timeOut: 3000,
  //           progressBar: true,
  //           progressAnimation: 'increasing',
  //           closeButton: true,
  //           positionClass: 'toast-top-right',
  //           tapToDismiss: true
  //         }
  //       );

  //       this._Router.navigate(['/tabs/explore']);
  //       this.loginForm.reset();
  //     },
  //     error: (err) => {
  //       console.error('Login flow failed', err);
  //       localStorage.setItem('points', '0');
  //     }
  //   });
  // }

  /* SignUp With User Point */
  // submitSignup(): void {
  //   if (this.signupForm.invalid) return;

  //   const data = this.signupForm.value;

  //   this._AuthService.register(data).pipe(
  //   // 1. خزّن توكن المستخدم
  //   tap((res: any) => {
  //     localStorage.setItem("tradelineToken", res.token);
  //   }),

  //   // 2. هات بيانات المستخدم
  //   switchMap((res: any) => this._AuthService.getUserInfo(res.token)),

  //   // 3. خزّن بيانات المستخدم
  //   tap((user: any) => {
  //     localStorage.setItem("userId", user.id);
  //     localStorage.setItem("userName", `${user.firstname} ${user.lastname}`);
  //     localStorage.setItem("phone", user.phone);
  //   }),

  //   // 4. هات توكن النقاط
  //   switchMap(() => this._AuthService.getPointsToken()),

  //   // 5. استخدم توكن النقاط علشان تجيب النقاط
  //   switchMap((pointsRes: any) => {
  //     const tokenPoints = pointsRes.access_token;
  //     const phone = localStorage.getItem('phone');

  //     return this._AuthService.getPoints(tokenPoints, phone);
  //   }),

  //   // 6. خزّن النقاط
  //   tap((res: any) => {
  //     const p = typeof res === 'string' ? JSON.parse(res) : res;
  //       localStorage.setItem('points', p.Points ?? '0');
  //     })

  //   ).subscribe({
  //     next: () => {
  //       this._ToastrService.success(
  //         `Login successful, ${localStorage.getItem('userName')}`,
  //         '',
  //         {
  //           timeOut: 3000,
  //           progressBar: true,
  //           progressAnimation: 'increasing',
  //           closeButton: true,
  //           positionClass: 'toast-top-right',
  //           tapToDismiss: true
  //         }
  //       );

  //       this._Router.navigate(['/tabs/explore']);
  //       this.loginForm.reset();
  //     },
  //     error: (err) => {
  //       console.error('Login flow failed', err);
  //       localStorage.setItem('points', '0');
  //     }
  //   });
  // }
}
