import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroGrupoUsuarioComponent } from './cadastro-grupo-usuario.component';

describe('CadastroGrupoUsuarioComponent', () => {
  let component: CadastroGrupoUsuarioComponent;
  let fixture: ComponentFixture<CadastroGrupoUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroGrupoUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroGrupoUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
