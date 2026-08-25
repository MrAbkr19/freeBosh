import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentLibraryTs } from './student-library.js';

describe('StudentLibraryTs', () => {
  let component: StudentLibraryTs;
  let fixture: ComponentFixture<StudentLibraryTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentLibraryTs],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentLibraryTs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
