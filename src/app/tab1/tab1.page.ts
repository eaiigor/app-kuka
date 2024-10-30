import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  pedido = {
    cliente: '',
    telefone: '',
    endereco: '',
    itens: [
      { qtd: 1, descricao: 'Abacaxi ao leite', valor: 10 },
      { qtd: 2, descricao: 'Açaí c/ Recheio de leite Condensado', valor: 15 },
      { qtd: 0, descricao: 'Chocolate', valor: 0 },
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

  adicionarItem() {
    this.pedido.itens.push({ qtd: 1, descricao: '', valor: 0 });
    this.calcularTotais();
  }

  gerarPDF() {
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

    // Gerando o PDF
    doc.save(`pedido-cliente-${this.pedido.cliente}.pdf`);
  }
}
