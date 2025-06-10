import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebpayExitoComponent } from './webpay-exito.component';

describe('WebpayExitoComponent', () => {
  let component: WebpayExitoComponent;
  let fixture: ComponentFixture<WebpayExitoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebpayExitoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WebpayExitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
