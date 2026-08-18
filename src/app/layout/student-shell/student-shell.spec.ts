import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentShell } from './student-shell';

describe('StudentShell', () => {
  let component: StudentShell;
  let fixture: ComponentFixture<StudentShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentShell],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
