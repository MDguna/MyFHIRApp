import { NgModule } from '@angular/core';
import { Browser1Page } from './browser1.page';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: Browser1Page
  }
];


@NgModule({
  declarations: [
    Browser1Page,
  ],
  imports: [
    RouterModule.forChild(routes),
    IonicModule,
    CommonModule,
    FormsModule
  ],
})
export class Browser1PageModule {}
