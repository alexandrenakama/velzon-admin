import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroSeguradoraComponent } from './cadastro-seguradora.component';

describe('CadastroSeguradoraComponent', () => {
  let component: CadastroSeguradoraComponent;
  let fixture: ComponentFixture<CadastroSeguradoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroSeguradoraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroSeguradoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
