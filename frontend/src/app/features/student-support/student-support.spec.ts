import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSupport } from './student-support';

describe('StudentSupport', () => {
  let component: StudentSupport;
  let fixture: ComponentFixture<StudentSupport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentSupport],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentSupport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
