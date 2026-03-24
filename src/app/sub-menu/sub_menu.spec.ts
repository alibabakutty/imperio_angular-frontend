import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubMenu } from './sub_menu';
import { RouterTestingModule } from '@angular/router/testing';

describe('SubMenu', () => {
  let component: SubMenu;
  let fixture: ComponentFixture<SubMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubMenu, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SubMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});