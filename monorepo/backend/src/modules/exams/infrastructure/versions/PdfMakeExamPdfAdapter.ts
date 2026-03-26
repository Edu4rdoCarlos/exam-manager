import { Injectable } from '@nestjs/common';
import { ExamPdfData, ExamPdfPort } from '../../application/versions/ports/ExamPdfPort';

@Injectable()
export class PdfMakeExamPdfAdapter implements ExamPdfPort {
  async generate(data: ExamPdfData): Promise<Buffer> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfmake = require('pdfmake/js/index');

    pdfmake.fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };

    pdfmake.setUrlAccessPolicy(() => false);

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
        {
          columns: [
            { text: `Disciplina: ${data.examSubject}`, style: 'subheader' },
            { text: `Data: ${examDateText}`, style: 'subheader', alignment: 'right' },
          ],
          margin: [0, 2, 0, 6],
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Nome: _______________________________________________', style: 'studentField', border: [false, false, false, false] },
                { text: 'CPF: ______________________________', style: 'studentField', border: [false, false, false, false] },
              ],
            ],
          },
          margin: [0, 0, 0, 6],
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }], margin: [0, 0, 0, 10] },
        ...questionContent,
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 8] },
        subheader: { fontSize: 11, margin: [0, 2, 0, 2] },
        question: { fontSize: 11, bold: true },
        alternative: { fontSize: 10 },
        answerField: { fontSize: 10, italics: true },
        studentField: { fontSize: 11 },
      },
    };

    return pdfmake.createPdf(docDefinition).getBuffer();
  }
}
