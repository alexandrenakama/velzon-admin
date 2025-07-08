import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroGrupoRamoComponent } from './cadastro-grupo-ramo.component';

describe('CadastroGrupoRamoComponent', () => {
  let component: CadastroGrupoRamoComponent;
  let fixture: ComponentFixture<CadastroGrupoRamoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroGrupoRamoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroGrupoRamoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
