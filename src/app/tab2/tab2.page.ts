import { Component } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  pdfFiles: { name: string; path: string }[] = [];

  constructor(private fileOpener: FileOpener) {}

  async ionViewDidEnter() {
    await this.loadPdfFiles();
  }

  async loadPdfFiles() {
    try {
      const result = await Filesystem.readdir({
        path: 'Pedidos',
        directory: Directory.Documents,
      });

      // Filtrando apenas arquivos PDF usando a propriedade name
      this.pdfFiles = result.files
        .filter(fileInfo => fileInfo.name.endsWith('.pdf')) // Correção aqui
        .map(fileInfo => ({
          name: fileInfo.name, // Aqui estamos pegando o nome corretamente
          path: `Pedidos/${fileInfo.name}`, // Construindo o caminho
        }));
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
    }
  }

  async openFile(filePath: string) {
    try {
      const fileUri = await Filesystem.getUri({
        path: filePath,
        directory: Directory.Documents,
      });

      await this.fileOpener.open(fileUri.uri, 'application/pdf');
    } catch (error) {
      console.error('Erro ao abrir o arquivo:', error);
      alert('Falha ao abrir o arquivo PDF');
    }
  }
}
