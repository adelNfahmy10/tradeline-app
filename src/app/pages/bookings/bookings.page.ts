import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';
import { BookingsService } from 'src/core/services/bookings/bookings-service';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class BookingsPage implements OnInit {
  private readonly _BookingsService = inject(BookingsService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  private addDays(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  public EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{1,5}$/;

  public MOBILE_REGEX = /^01[0-5][0-9]{8}$/;

  step: number = 2;

  stores: any[] = [
    { id: 3, name: 'City Stars Mall' },
    { id: 6, name: 'Concord Plaza Mall - Kattameyal' },
    { id: 5, name: 'Mall Of Arabia' },
    { id: 9, name: 'Sodic - Authorised Service Provider' },
  ];

  minDate: string = this.formatDate(this.addDays(1));
  maxDate: string = this.formatDate(this.addDays(7));

  ngOnInit(): void {}

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  validateEmail(email: string): boolean {
    if (!email) {
      return false;
    }

    return this.EMAIL_REGEX.test(email);
  }

  validatePhone(phone: string): boolean {
    if (!phone) {
      return false;
    }

    return this.MOBILE_REGEX.test(phone);
  }

  book(appointment: any): void {
    let err: string | null = null;

    if (!appointment.valid) {
      err = 'All fields are required.';
    }

    if (err === null && !this.validatePhone(appointment.value.bphone)) {
      err = 'Please enter a correct phone number.';
    }

    if (err === null && !this.validateEmail(appointment.value.bemail)) {
      err = 'Please enter a correct email address.';
    }

    if (err === null) {
      this.submitBook(appointment.value);
    }
  }

  submitBook(values: any): void {
    this._BookingsService
      .getBookApointment(
        values.bname,
        values.bphone,
        values.bdate,
        values.btime,
        values.bemail,
        values.branch,
      )
      .subscribe({
        next: (res) => {
          console.log(res);
        },
      });
  }
}
