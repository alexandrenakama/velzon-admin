import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaRamoComponent } from './lista-ramo.component';

describe('ListaRamoComponent', () => {
  let component: ListaRamoComponent;
  let fixture: ComponentFixture<ListaRamoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaRamoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaRamoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
