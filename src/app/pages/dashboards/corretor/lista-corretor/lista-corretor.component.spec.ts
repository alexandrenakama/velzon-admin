import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCorretorComponent } from './lista-corretor.component';

describe('ListaCorretorComponent', () => {
  let component: ListaCorretorComponent;
  let fixture: ComponentFixture<ListaCorretorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCorretorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaCorretorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
