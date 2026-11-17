import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EasypayPage } from './easypay.page';

describe('EasypayPage', () => {
  let component: EasypayPage;
  let fixture: ComponentFixture<EasypayPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EasypayPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
