import { NgModule } from '@angular/core';
import { BluebuttonPage } from './bluebutton.page';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: BluebuttonPage
  }
];


@NgModule({
  declarations: [
    BluebuttonPage,
  ],
  imports: [
    RouterModule.forChild(routes),
    IonicModule,
    CommonModule,
    FormsModule
  ],
})
export class BluebuttonPageModule {}
