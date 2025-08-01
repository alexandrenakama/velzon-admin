import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroFilialComponent } from './cadastro-filial.component';

describe('CadastroFilialComponent', () => {
  let component: CadastroFilialComponent;
  let fixture: ComponentFixture<CadastroFilialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroFilialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroFilialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
