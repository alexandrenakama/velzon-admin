import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaGrupoRamoComponent } from './lista-grupo-ramo.component';

describe('ListaGrupoRamoComponent', () => {
  let component: ListaGrupoRamoComponent;
  let fixture: ComponentFixture<ListaGrupoRamoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaGrupoRamoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaGrupoRamoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
