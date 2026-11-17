import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonReloadPage } from './skeleton-reload.page';

describe('SkeletonReloadPage', () => {
  let component: SkeletonReloadPage;
  let fixture: ComponentFixture<SkeletonReloadPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SkeletonReloadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
