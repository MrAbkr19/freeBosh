import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBulkImport } from './admin-bulk-import';

describe('AdminBulkImport', () => {
  let component: AdminBulkImport;
  let fixture: ComponentFixture<AdminBulkImport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBulkImport],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBulkImport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
