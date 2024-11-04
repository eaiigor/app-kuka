import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  pedido = {
    cliente: 'Nome do Cliente',
    telefone: '(35) 9 9898 9959',
    endereco: 'Endereço do Cliente',
    itens: [
      { qtd: 1, descricao: 'Abacaxi ao leite', valor: 10 },
      { qtd: 2, descricao: 'Açaí c/ Recheio de leite Condensado', valor: 15 },
    ]
  };

  quantidadeTotal: number = 0;
  valorTotal: number = 0;

  constructor() {
    this.calcularTotais();
  }

  calcularTotais() {
    this.quantidadeTotal = this.pedido.itens.reduce((sum, item) => sum + item.qtd, 0);
    this.valorTotal = this.pedido.itens.reduce((sum, item) => sum + (item.qtd * item.valor), 0);
  }

  async gerarPDF() {
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(18);
    doc.text('Kuka Gellada Sorvetes', 10, 10);
    doc.setFontSize(12);
    doc.text('Bloco de Pedidos', 10, 20);
    doc.text('Contato: 35 9 9898 9959', 10, 30);

    // Informações do cliente
    doc.setFontSize(10);
    doc.text(`Cliente: ${this.pedido.cliente}`, 10, 40);
    doc.text(`Tel: ${this.pedido.telefone}`, 10, 50);
    doc.text(`Endereço: ${this.pedido.endereco}`, 10, 60);

    // Tabela de pedidos
    autoTable(doc, {
      startY: 70,
      head: [['Qtd.', 'Descrição dos Sabores Ituzinhos', 'Valor Total']],
      body: this.pedido.itens.map(item => [item.qtd, item.descricao, `R$ ${item.valor.toFixed(2)}`]),
      theme: 'grid',
      headStyles: { fillColor: [255, 0, 0] },
      columnStyles: {
        0: { halign: 'center' },
        2: { halign: 'right' }
      },
    });

    // Adicionando linha de quantidade total e valor total
    const finalY = (doc as any).lastAutoTable.finalY || 70;
    doc.setFontSize(12);
    doc.text(`Quantidades dos Ituzinhos: ${this.quantidadeTotal}`, 10, finalY + 10);
    doc.text(`Valor total: R$ ${this.valorTotal.toFixed(2)}`, 140, finalY + 10);

    // Obtenha o conteúdo PDF como um Blob
    const pdfBlob = doc.output('blob');

    // Converte o Blob em Base64 para o Capacitor
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      const binaryData = base64data.split(',')[1]; // Remova o prefixo 'data:application/pdf;base64,'

      // Caminho para a nova pasta e arquivo
      const pasta = 'Pedidos';
      const nomeArquivo = `pedido-cliente-${this.pedido.cliente}.pdf`;

      try {
        // Verifica se o diretório "Pedidos" já existe
        await Filesystem.stat({
          path: pasta,
          directory: Directory.Documents,
        });
      } catch (error) {
        // Cria o diretório "Pedidos" em Documents se ele não existir
        await Filesystem.mkdir({
          path: pasta,
          directory: Directory.Documents,
          recursive: true
        });
      }

      try {
        // Salva o arquivo PDF na pasta "Pedidos" sem especificar encoding
        await Filesystem.writeFile({
          path: `${pasta}/${nomeArquivo}`,
          data: binaryData,
          directory: Directory.Documents
        });

        alert('PDF salvo na pasta "Pedidos" dentro de Documentos do dispositivo');
      } catch (error) {
        console.error('Erro ao salvar PDF:', error);
        alert('Falha ao salvar o PDF');
      }
    };
  }


  adicionarItem() {
    this.pedido.itens.push({ qtd: 1, descricao: '', valor: 0 });
    this.calcularTotais();
  }

}
