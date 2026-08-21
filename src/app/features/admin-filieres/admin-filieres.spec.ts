import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFilieres } from './admin-filieres';

describe('AdminFilieres', () => {
  let component: AdminFilieres;
  let fixture: ComponentFixture<AdminFilieres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFilieres],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminFilieres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
