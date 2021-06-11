import { NgModule } from '@angular/core';
import { Browser2Page } from './browser2.page';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: Browser2Page
  }
];


@NgModule({
  declarations: [
    Browser2Page,
  ],
  imports: [
    RouterModule.forChild(routes),
    IonicModule,
    CommonModule,
    FormsModule
  ],
})
export class Browser2PageModule {}



