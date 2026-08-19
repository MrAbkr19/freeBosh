import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherShell } from './teacher-shell';

describe('TeacherShell', () => {
  let component: TeacherShell;
  let fixture: ComponentFixture<TeacherShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherShell],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
