import { Injectable } from '@nestjs/common';
import { ExamPdfData, ExamPdfPort } from '../../application/versions/ports/ExamPdfPort';

@Injectable()
export class PdfMakeExamPdfAdapter implements ExamPdfPort {
  async generate(data: ExamPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const PdfPrinterModule = require('pdfmake/src/printer');
      const PdfPrinter = PdfPrinterModule.default ?? PdfPrinterModule;

      const fonts = {
        Helvetica: {
          normal: 'Helvetica',
          bold: 'Helvetica-Bold',
          italics: 'Helvetica-Oblique',
          bolditalics: 'Helvetica-BoldOblique',
        },
      };

      const printer = new PdfPrinter(fonts);

      const answerFieldLabel =
        data.answerFormat === 'letters' ? 'Resposta: _______________' : 'Soma: _______________';

      const examDateText = data.examDate
        ? data.examDate.toLocaleDateString('pt-BR')
        : 'Data a definir';

      const questionContent = data.questions.flatMap((q) => [
        {
          text: `${q.position}. ${q.statement}`,
          style: 'question',
          margin: [0, 10, 0, 4],
        },
        ...q.alternatives.map((a) => ({
          text: `   ${a.label})  ${a.description}`,
          style: 'alternative',
          margin: [8, 1, 0, 1],
        })),
        { text: answerFieldLabel, style: 'answerField', margin: [0, 6, 0, 0] },
      ]);

      const docDefinition = {
        defaultStyle: { font: 'Helvetica', fontSize: 11 },
        footer: (_currentPage: number, _pageCount: number, pageSize: { width: number }) => ({
          canvas: [],
          text: `Versão ${data.versionNumber}`,
          alignment: 'center',
          fontSize: 9,
          margin: [0, 0, 0, 0],
          width: pageSize.width,
        }),
        content: [
          { text: data.examTitle, style: 'header' },
          { text: `Disciplina: ${data.examSubject}`, style: 'subheader' },
          { text: `Data: ${examDateText}`, style: 'subheader' },
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }], margin: [0, 8, 0, 8] },
          ...questionContent,
          { text: '\n\n\n' },
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }], margin: [0, 0, 0, 12] },
          { text: 'Nome: _______________________________________________', style: 'studentField' },
          { text: 'CPF:   _______________________________________________', style: 'studentField', margin: [0, 8, 0, 0] },
        ],
        styles: {
          header: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 6] },
          subheader: { fontSize: 11, margin: [0, 2, 0, 2] },
          question: { fontSize: 11, bold: true },
          alternative: { fontSize: 10 },
          answerField: { fontSize: 10, italics: true },
          studentField: { fontSize: 12 },
        },
      };

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];

      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }
}
