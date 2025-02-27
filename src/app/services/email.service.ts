import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, from, filter } from 'rxjs';
import { Email } from '../models/email';
import { LoadingEmails } from '../store/actions/email.actions';
import { EmailState } from '../store/reducers/email.reducer';
import { UtilService } from './util.service';

// import * as demoMails from '../../assets/data/demoMails.json' 

import { storageService } from './async-storage.service'
import { FilterBy } from '../models/filterBy';
import { Label } from '../models/label';
import { environment } from 'src/environments/environment';

export const EMAIL_KEY = 'email'
export const LABEL_KEY = 'label'

@Injectable({
    providedIn: 'root',
})
export class EmailService {

    private apiUrl = `${environment.apiUrl}/email`;

    loggedinUser = {
        email: 'user@gmail.com',
        fullname: 'Mail User'
    }

    constructor(private store: Store<EmailState>,
        private http: HttpClient,
        private utilService: UtilService) {

        const emails = JSON.parse(localStorage.getItem(EMAIL_KEY) || 'null');
        if (!emails || emails.length === 0) {
            localStorage.setItem(EMAIL_KEY, JSON.stringify(this._createEmails()))
        }

        const labels = JSON.parse(localStorage.getItem(LABEL_KEY) || 'null');
        if (!labels || labels.length === 0) {
            localStorage.setItem(LABEL_KEY, '[]')
        }

    }

    query(filterBy: FilterBy = {}): Observable<{ entities: Email[], totalPages: number }> {
        this.store.dispatch(new LoadingEmails());
        // console.log('EmailService: Return Emails ===> effect');
        return from(storageService.query(EMAIL_KEY, filterBy) as Promise<{ entities: Email[], totalPages: number }>)
        // return new Observable((observer) => observer.next(emails));
    }

    getById(emailId: string): Observable<Email> {
        // console.log('EmailService: Return Email ===> effect');
        return from(storageService.get(EMAIL_KEY, emailId) as Promise<Email>)
        // return from(axios.get(URL + emailId) as Promise<Email>)
    }

    remove(emailId: string): Observable<boolean> {
        // console.log('EmailService: Removing Email ===> effect');
        return from(storageService.remove(EMAIL_KEY, emailId))
    }

    removeMany(emails: Email[]): Observable<Email[]> {
        // console.log('EmailService: Removing Emails ===> effect');
        return from(storageService.removeMany(EMAIL_KEY, emails) as Promise<Email[]>)
    }


    save(email: Email): Observable<Email> {
        const method = (email._id) ? 'put' : 'post'
        // console.log('SERVICE:', method, 'email:', email)
        if (!email._id) email = {
            ...email,
            from: this.loggedinUser.email,
            name: this.loggedinUser.fullname,
            isRead: true,
            labels: [],
        }
        const prmSavedEmail = storageService[method](EMAIL_KEY, email)
        // console.log('EmailService: Saving Email ===> effect');
        return from(prmSavedEmail) as Observable<Email>
    }

    updateMany(emails: Email[]): Observable<Email[]> {
        // console.log('EmailService: updated Emails ===> effect');
        return from(storageService.putMany(EMAIL_KEY, emails) as Promise<Email[]>)
    }

    private _createEmails(): Email[] {

        let emails = []
        for (var i = 0; i < 80; i++) {
            emails.push(this._createEmail())
        }
        return emails
    }
    private _createEmail(): Email {
        const isIncoming = Math.random() > .5 ? true : false
        const name = this.utilService.makeName()
        const {subject,body} = this.utilService.generateEmailContent()
        const email = {
            _id: this.utilService.makeId(),
            tabs: isIncoming ? [Math.random() > .5 ? 'starred' : 'important', Math.random() > .3 ? 'inbox' : 'spam'] : [Math.random() > .5 ? 'important' : 'starred', 'sent'],
            name: isIncoming ? name : this.loggedinUser.fullname,
            subject,
            body,
            isRead: (Math.random() > .5 && isIncoming) ? false : true,
            savedAt: this.utilService.randomTimestamp(),
            from: isIncoming ? `${name.split(' ')[0].toLowerCase()}@gmail.com` : this.loggedinUser.email,
            to: isIncoming ? this.loggedinUser.email : `${name.split(' ')[0].toLowerCase()}@gmail.com`,
            labels: []
        }
        return email
    }



    // LABEL FUNCTIONS:
    getLabels() {
        return from(storageService.query(LABEL_KEY) as Promise<{ entities: Label[], totalPages: number }>)
        // return new Observable((observer) => observer.next(emails));
    }

    saveLabel(label: Label): Observable<Label> {
        const method = (label._id) ? 'putLabel' : 'postLabel'
        const prmSavedLabel = storageService[method](LABEL_KEY, label)
        // console.log('EmailService: Saving Email ===> effect');
        return from(prmSavedLabel) as Observable<Label>
    }

    removeLabel(labelId: string): Observable<boolean> {
        // console.log('EmailService: Removing Email ===> effect');
        return from(storageService.remove(LABEL_KEY, labelId))
    }



     /**
   * Obtiene correos paginados por usuario y carpeta
   * @param userId ID del usuario
   * @param folder Nombre de la carpeta (INBOX, SENT, etc.)
   * @param page Número de página (por defecto 0)
   * @param size Cantidad de correos por página (por defecto 10)
   * @returns Observable con la lista de correos paginada
   */
  getEmails(userId: number, folder: string, page: number = 0, size: number = 10): Observable<any> {
    console.log(`Obteniendo correos para usuario ${userId}, carpeta ${folder}, página ${page}, tamaño ${size}`);

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/${userId}/${folder}`, { params });
  }

  /**
   * Obtiene un correo específico por su ID
   * @param emailId ID del correo
   * @returns Observable con la información del correo
   */
  getEmailById(emailId: number): Observable<any> {
    console.log(`Obteniendo correo con ID ${emailId}`);
    return this.http.get<any>(`${this.apiUrl}/${emailId}`);
  }

  /**
   * Elimina un correo por su ID
   * @param emailId ID del correo a eliminar
   * @returns Observable con la respuesta del servidor
   */
  deleteEmail(emailId: number): Observable<any> {
    console.log(`Eliminando correo con ID ${emailId}`);
    return this.http.delete<any>(`${this.apiUrl}/${emailId}`);
  }

  getUserFoldersByEmail(email: string): Observable<string[]> {
    console.log(`Obteniendo carpetas de correo para ${email}`);
    return this.http.get<string[]>(`${this.apiUrl}/folders`, { params: { email } });
  }
  
  getEmailsByUserEmailAndFolder(email: string, folder: string, page: number = 0, size: number = 10): Observable<any> {
    console.log(`Obteniendo correos para ${email} en la carpeta ${folder}, página ${page}, tamaño ${size}`);
    
    const params = new HttpParams()
      .set('email', email)
      .set('folder', folder)
      .set('page', page.toString())
      .set('size', size.toString());
  
    return this.http.get<any>(`${this.apiUrl}/by-folder`, { params });
  }
  
  
}

