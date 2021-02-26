import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent {
  
  constructor(private service: GlobalService, private _snackBar: MatSnackBar, public dialogRef: MatDialogRef<PasswordComponent>) {}
  
  generate(old: string, nw1: string, nw2: string){
    if (nw1 !== nw2){
      this._snackBar.open('New Passwords doesn\'t match', 'MBFW');
    }
    else if (nw1.length<4) {
      this._snackBar.open('Password must contain atleast 4 characters', 'MBFW');
    }
    else{
      const userName = sessionStorage.getItem('player');
      this.service.post([userName, old, nw1], 'Post').subscribe(()=>{
        this._snackBar.open('Changed successfully', '-MBFW-', {panelClass: 'happy'});
        this.dialogRef.close();
      },
      err => {
        this._snackBar.open('Incorrect old password.', 'Authentication failed.');
      })
    }
  }
}
