import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaFilialComponent } from './lista-filial.component';

describe('ListaFilialComponent', () => {
  let component: ListaFilialComponent;
  let fixture: ComponentFixture<ListaFilialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaFilialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaFilialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
