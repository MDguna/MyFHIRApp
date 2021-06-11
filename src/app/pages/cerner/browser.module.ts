import { NgModule } from '@angular/core';
import { BrowserPage } from './browser.page';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: BrowserPage
  }
];

@NgModule({
  declarations: [
    BrowserPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
    
  ],
})
export class BrowserPageModule {}
