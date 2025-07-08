import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroRamoComponent } from './cadastro-ramo.component';

describe('NovoRamoComponent', () => {
  let component: CadastroRamoComponent;
  let fixture: ComponentFixture<CadastroRamoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroRamoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroRamoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
