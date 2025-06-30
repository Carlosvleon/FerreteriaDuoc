import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarritoDetalleComponent } from './carrito-detalle.component';

describe('CarritoDetalleComponent', () => {
  let component: CarritoDetalleComponent;
  let fixture: ComponentFixture<CarritoDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarritoDetalleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CarritoDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
