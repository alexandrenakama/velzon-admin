import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaSeguradoraComponent } from './lista-seguradora.component';

describe('ListaSeguradoraComponent', () => {
  let component: ListaSeguradoraComponent;
  let fixture: ComponentFixture<ListaSeguradoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaSeguradoraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaSeguradoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
