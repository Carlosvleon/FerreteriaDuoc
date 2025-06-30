import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductoEditComponent } from './admin-producto-edit.component';

describe('AdminProductoEditComponent', () => {
  let component: AdminProductoEditComponent;
  let fixture: ComponentFixture<AdminProductoEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductoEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminProductoEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
