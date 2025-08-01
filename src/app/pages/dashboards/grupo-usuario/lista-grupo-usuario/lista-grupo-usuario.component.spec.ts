import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaGrupoUsuarioComponent } from './lista-grupo-usuario.component';

describe('ListaGrupoUsuarioComponent', () => {
  let component: ListaGrupoUsuarioComponent;
  let fixture: ComponentFixture<ListaGrupoUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaGrupoUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaGrupoUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
