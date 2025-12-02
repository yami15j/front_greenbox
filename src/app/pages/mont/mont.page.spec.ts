import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MontPage } from './mont.page';

describe('MontPage', () => {
  let component: MontPage;
  let fixture: ComponentFixture<MontPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MontPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
