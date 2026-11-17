import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderSuccessfullyPage } from './order-successfully.page';

describe('OrderSuccessfullyPage', () => {
  let component: OrderSuccessfullyPage;
  let fixture: ComponentFixture<OrderSuccessfullyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSuccessfullyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
