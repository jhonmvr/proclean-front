import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  errorMessage: string = '';
  loginForm: FormGroup;
  

  constructor(private fb: FormBuilder, private router: Router, private authService: LoginService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    console.log("entra a submit")
     this.authService.login(this.loginForm.controls['email'].value, this.loginForm.controls['password'].value).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        console.log('Login exitoso, token:', response.token);
        //this.router.navigate(["/inbox"])
      },
      error: (error) => {
        this.errorMessage = 'Usuario o contrasena incorrectos';
        console.error('Error de login:', error);
      }
    }); 
  }

}
