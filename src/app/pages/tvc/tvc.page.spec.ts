import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TvcPage } from './tvc.page';

describe('TvcPage', () => {
  let component: TvcPage;
  let fixture: ComponentFixture<TvcPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TvcPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
